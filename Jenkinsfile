pipeline {
    agent any

    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-creds')  // Jenkins DockerHub credentials ID
        EC2_SSH_CREDENTIALS = 'ec2-ssh'                          // Jenkins SSH credentials ID
        IMAGE_NAME = 'yourdockerhubusername/prodigyhire-app'     // Replace with your DockerHub repo
        EC2_IP = 'your.ec2.public.ip'                            // Replace with your EC2 public IP
    }

    stages {
        stage('Clone Repository') {
            steps {
                git 'https://github.com/yourusername/prodigyhire.git'  // Replace with your repo
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $IMAGE_NAME .'
            }
        }

        stage('Push Image to DockerHub') {
            steps {
                script {
                    docker.withRegistry('', DOCKERHUB_CREDENTIALS) {
                        sh 'docker push $IMAGE_NAME'
                    }
                }
            }
        }

        stage('Deploy to AWS EC2') {
            steps {
                sshagent (credentials: [EC2_SSH_CREDENTIALS]) {
                    sh """
                    ssh -o StrictHostKeyChecking=no ubuntu@$EC2_IP '
                        docker pull $IMAGE_NAME &&
                        docker stop prodigyhire-app || true &&
                        docker rm prodigyhire-app || true &&
                        docker run -d --name prodigyhire-app -p 80:3000 $IMAGE_NAME
                    '
                    """
                }
            }
        }
    }
}
