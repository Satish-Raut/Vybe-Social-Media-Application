# This file creates the Elastic Container Registry (ECR) repositories.
# This is like my own private "DockerHub" on AWS where i will upload our images.

resource "aws_ecr_repository" "vybe_frontend" {
  name                 = "vybe-frontend"
  image_tag_mutability = "MUTABLE" 
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "vybe_backend" {
  name                 = "vybe-backend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration {
    scan_on_push = true
  }
}
