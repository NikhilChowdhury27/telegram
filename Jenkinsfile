#!/bin/groovy
pipeline{
    agent any
    environment {
        BRANCH_NAME = "${BRANCH_NAME}"
        SERVICE = "${SERVICE}"
        ENVIRONMENT = "${ENVIRONMENT}"
        build_tag = "1.1.1"
    }
    tools {
        nodejs "nodejs"
        git "Default"
        dockerTool "docker"
    }
    stages{
        stage("Checkout branch"){
            steps{
                echo "Pulling ${env.BRANCH_NAME}"
                git branch: env.BRANCH_NAME ,credentialsId:'gitcreds',url:'https://github.com/XPrepOfficial/classplus-boilerplate.git'
            }
        }
        stage("Install Dependencies"){
            steps{
                echo "Installing dependencies"
                withCredentials([usernamePassword(credentialsId: 'gitcreds', passwordVariable: 'PASSWORD', usernameVariable: 'USERNAME')]) {
                    sh "git config --global credential.username ${USERNAME}"
                    sh 'git config --global credential.helper "!echo password=${PASSWORD}; echo"'
                    sh "npm i"
                }
            }
        }
        stage("Get configurations"){
            steps{
                echo "Cloning git configurations for ${ENVIRONMENT} environment"
                sh "rm -rf classplus-configurations; mkdir -p classplus-configurations; cd classplus-configurations"
                dir("classplus-configurations"){
                    git branch: "master", credentialsId: "gitcreds", url: "https://github.com/XPrepOfficial/classplus-configurations.git"
                }
                sh "mv classplus-configurations/${SERVICE}/${ENVIRONMENT}/.env .env"
                sh "mv classplus-configurations/${SERVICE}/${ENVIRONMENT}/firebase.json firebase.json"
                load ".env"
            }
        }
        stage('Test Suit'){
            steps{
                echo 'Running Test Cases......'
                sh 'npm run test'
            }
            post {
                 success {
                     script {
                        println "All the tests passed......"
                        println "Running code-coverage tools"
                        sh 'npm run coverage'
                        sh 'npm run sonar'
                     }
                 }
                 failure {
                     println "There are some failing tests."
                 }
            }
        }
        stage("Build"){
            steps{
                echo "Build Docker"
                script{
                    docker.build("${INITIAL_DOCKER}","  .")
                }

                echo "Push Docker"
                script{
                    docker.withRegistry("${EKS_ECR_PATH}", 'ecr:ap-south-1:AWS Credentials') {
                        docker.image("${INITIAL_DOCKER}").push("${build_tag}")
                    }
                }

                echo "Remove Images"
                sh "docker rmi ${INITIAL_DOCKER}:latest"
                sh "docker rmi ${EKS_ECR_IMAGE}:${build_tag}"
            }
        }
        stage("Deploy"){
            steps{
                script{
                    echo "Hello creds ${EKS_CREDS_ID}"
                    withKubeConfig([credentialsId: 'ekspreprod']){
                        sh "kubectl set image deployment/${INITIAL_DOCKER} ${INITIAL_DOCKER}=${EKS_ECR_IMAGE}:${build_tag}"
                    }
                }
            }
        }
    }
}
