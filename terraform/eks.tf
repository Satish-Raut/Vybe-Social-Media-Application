# This file creates our Kubernetes Cluster (EKS) on AWS.
# I am using the official AWS EKS module because it automatically handles all the complex IAM permissions for me!

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "vybe-cluster"
  cluster_version = "1.30" 

  # This allows us to connect to the cluster from our local computer
  cluster_endpoint_public_access = true

  # Grant cluster-admin permissions to the IAM identity creating the EKS cluster
  enable_cluster_creator_admin_permissions = true


  # We tell the cluster to live inside the VPC and Subnets we just created in vpc.tf
  vpc_id     = aws_vpc.vybe_vpc.id
  subnet_ids = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]

  # Allow the Jenkins EC2 server to securely talk to the EKS Kubernetes API
  cluster_security_group_additional_rules = {
    ingress_jenkins_https = {
      description              = "Allow Jenkins SG to communicate with EKS API"
      protocol                 = "tcp"
      from_port                = 443
      to_port                  = 443
      type                     = "ingress"
      source_security_group_id = aws_security_group.jenkins_sg.id
    }
  }

  # Allow all node-to-node traffic so pods can communicate across nodes on low ports (like Nginx on Port 80)
  node_security_group_additional_rules = {
    ingress_self_all = {
      description = "Node to node all traffic"
      protocol    = "-1"
      from_port   = 0
      to_port     = 0
      type        = "ingress"
      self        = true
    }
  }


  # This creates the actual EC2 servers (Worker Nodes) where your pods will run
  eks_managed_node_groups = {
    vybe_nodes = {
      min_size     = 1
      max_size     = 3
      desired_size = 2 

      instance_types = ["t3.small"] 
      capacity_type  = "ON_DEMAND"
    }
  }

  tags = {
    Environment = "dev"
    Project     = "vybe"
  }
}
