#!/bin/bash
# Vybe - Jenkins, Docker, and Kubectl Setup Script
# Run this on your AWS EC2 Amazon Linux 2023 instance

echo "Starting Installation..."

# 1. Update system
sudo dnf update -y

# 2. Install Java 21 (Required for Jenkins)
sudo dnf install java-21-amazon-corretto -y

# 3. Add Jenkins Repository and Key
sudo wget -O /etc/yum.repos.d/jenkins.repo https://pkg.jenkins.io/redhat-stable/jenkins.repo
sudo rpm --import https://pkg.jenkins.io/redhat-stable/jenkins.io-2023.key

# 4. Install Jenkins
sudo dnf install jenkins -y
sudo systemctl enable jenkins
sudo systemctl start jenkins

# 5. Install Docker (so Jenkins can build your images)
sudo dnf install docker -y
sudo systemctl enable docker
sudo systemctl start docker

# 6. Add users to the docker group so they can run commands without 'sudo'
sudo usermod -aG docker ec2-user
sudo usermod -aG docker jenkins

# Restart Jenkins so it picks up the docker group permissions
sudo systemctl restart jenkins

# 7. Install Git
sudo dnf install git -y

# 8. Install Kubectl (to control the EKS cluster)
curl -O https://s3.us-west-2.amazonaws.com/amazon-eks/1.30.0/2024-05-12/bin/linux/amd64/kubectl
chmod +x ./kubectl
sudo mv ./kubectl /usr/local/bin/kubectl

echo "=========================================="
echo "✅ Setup Complete!"
echo "Your Jenkins initial Admin Password is:"
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
echo "=========================================="
