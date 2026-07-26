# This file creates the EC2 Virtual Machine that will run Jenkins for our CI/CD pipeline.

data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
}

# Create a Security Group (Firewall) for Jenkins
resource "aws_security_group" "jenkins_sg" {
  name        = "jenkins-sg"
  description = "Allow SSH and Jenkins traffic"
  vpc_id      = aws_vpc.vybe_vpc.id

  # Allow SSH (Port 22) so we can log into the server
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow Web Traffic (Port 8080) so we can open the Jenkins web dashboard
  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow the server to download packages from the internet
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "vybe-jenkins-sg"
  }
}


resource "tls_private_key" "jenkins_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "jenkins_key_pair" {
  key_name   = "vybe-jenkins-key"
  public_key = tls_private_key.jenkins_key.public_key_openssh
}

# Save the private key to a file on your local machine
resource "local_file" "jenkins_private_key" {
  content         = tls_private_key.jenkins_key.private_key_pem
  filename        = "${path.module}/vybe-jenkins-key.pem"
  file_permission = "0400"
}

# 4. Create the actual EC2 Instance
resource "aws_instance" "jenkins_server" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.small" 
  
  # Put it in our public subnet so it gets an internet connection
  subnet_id                   = aws_subnet.public_subnet_1.id
  vpc_security_group_ids      = [aws_security_group.jenkins_sg.id]
  associate_public_ip_address = true
  
  key_name = aws_key_pair.jenkins_key_pair.key_name

  tags = {
    Name = "vybe-jenkins-server"
  }
}

#  Output the public IP address so we know exactly where to connect
output "jenkins_public_ip" {
  value       = aws_instance.jenkins_server.public_ip
  description = "The public IP of our Jenkins Server"
}
