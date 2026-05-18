# This file creates our Elastic Container Registry (ECR) repositories.
# This is like our own private "DockerHub" on AWS where we will upload our images.

resource "aws_ecr_repository" "vybe_frontend" {
  name                 = "vybe-frontend"
  image_tag_mutability = "MUTABLE" # Allows us to overwrite the 'latest' tag

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "vybe_backend" {
  name                 = "vybe-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}
