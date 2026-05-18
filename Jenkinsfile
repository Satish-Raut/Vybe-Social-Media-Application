pipeline {
    agent any

    environment {
        // These variables define exactly where your AWS resources are
        AWS_ACCOUNT_ID = "510473517678" // Fetched from your ECR screenshot
        AWS_REGION = "us-east-1"
        ECR_FRONTEND = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/vybe-frontend"
        ECR_BACKEND = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/vybe-backend"
        EKS_CLUSTER_NAME = "vybe-cluster"
    }

    stages {
        stage('Checkout Code') {
            steps {
                echo "1. Pulling the latest code from GitHub..."
                checkout scm
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    echo "2a. Building Frontend Image..."
                    sh "docker build -t vybe-frontend ./Client"
                    
                    echo "2b. Building Backend Image..."
                    sh "docker build -t vybe-backend ./Server"
                }
            }
        }

        stage('Push to AWS ECR') {
            steps {
                script {
                    echo "3a. Logging into AWS ECR..."
                    sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
                    
                    echo "3b. Tagging Images for ECR..."
                    sh "docker tag vybe-frontend:latest ${ECR_FRONTEND}:latest"
                    sh "docker tag vybe-backend:latest ${ECR_BACKEND}:latest"
                    
                    echo "3c. Pushing Images to the Cloud..."
                    sh "docker push ${ECR_FRONTEND}:latest"
                    sh "docker push ${ECR_BACKEND}:latest"
                }
            }
        }

        stage('Deploy to EKS Kubernetes') {
            steps {
                script {
                    echo "4a. Connecting Jenkins to the EKS Cluster..."
                    sh "aws eks update-kubeconfig --region ${AWS_REGION} --name ${EKS_CLUSTER_NAME}"
                    
                    echo "4b. Injecting ECR Image URLs into K8s Manifests..."
                    // This dynamically replaces your local image names with the AWS Cloud image URLs
                    sh "sed -i 's|socialmediaplatformvybe-frontend:latest|${ECR_FRONTEND}:latest|g' ./k8s/frontend-deployment.yaml"
                    sh "sed -i 's|socialmediaplatformvybe-backend:latest|${ECR_BACKEND}:latest|g' ./k8s/backend-deployment.yaml"

                    echo "4c. Applying Kubernetes Manifests..."
                    sh "kubectl apply -f ./k8s/backend-deployment.yaml -f ./k8s/backend-service.yaml -f ./k8s/frontend-deployment.yaml -f ./k8s/frontend-service.yaml -f ./k8s/ingress.yaml"
                    
                    echo "4d. Force Restarting Pods to Pull New Images..."
                    sh "kubectl rollout restart deployment vybe-frontend"
                    sh "kubectl rollout restart deployment vybe-backend"
                }
            }
        }
    }
}
