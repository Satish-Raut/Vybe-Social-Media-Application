# This file creates our Kubernetes Cluster (EKS) on AWS.
# We are using the official AWS EKS module because it automatically handles all the complex IAM permissions for me!

module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "vybe-cluster"
  cluster_version = "1.30" # The version of Kubernetes we want to use

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


  # This creates the actual EC2 servers (Worker Nodes) where your pods will run
  eks_managed_node_groups = {
    vybe_nodes = {
      min_size     = 1
      max_size     = 3
      desired_size = 2 # We need 2 nodes because t2.micro is very small

      instance_types = ["t3.small"] # Changed to comply with AWS Student Free Tier
      capacity_type  = "ON_DEMAND"
    }
  }

  tags = {
    Environment = "dev"
    Project     = "vybe"
  }
}
