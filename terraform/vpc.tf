# This file creates our Virtual Private Cloud (VPC), which is our isolated network on AWS.

resource "aws_vpc" "vybe_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "vybe-vpc"
  }
}

# Internet Gateway to allow our VPC to connect to the internet
resource "aws_internet_gateway" "vybe_igw" {
  vpc_id = aws_vpc.vybe_vpc.id

  tags = {
    Name = "vybe-igw"
  }
}

# 2 Public Subnets in different Availability Zones (Required for EKS)
resource "aws_subnet" "public_subnet_1" {
  vpc_id                  = aws_vpc.vybe_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-east-1a"
  map_public_ip_on_launch = true # This ensures our EC2 instances get a public IP

  tags = {
    Name = "vybe-public-1"
    "kubernetes.io/role/elb" = "1" # Required tag for Kubernetes load balancers
  }
}

resource "aws_subnet" "public_subnet_2" {
  vpc_id                  = aws_vpc.vybe_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "us-east-1b"
  map_public_ip_on_launch = true

  tags = {
    Name = "vybe-public-2"
    "kubernetes.io/role/elb" = "1"
  }
}

# Route Table to direct traffic to the Internet Gateway
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.vybe_vpc.id

  route {
    cidr_block = "0.0.0.0/0" # This means "all internet traffic"
    gateway_id = aws_internet_gateway.vybe_igw.id
  }

  tags = {
    Name = "vybe-public-rt"
  }
}

# Associate our subnets with the route table
resource "aws_route_table_association" "public_rt_assoc_1" {
  subnet_id      = aws_subnet.public_subnet_1.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "public_rt_assoc_2" {
  subnet_id      = aws_subnet.public_subnet_2.id
  route_table_id = aws_route_table.public_rt.id
}
