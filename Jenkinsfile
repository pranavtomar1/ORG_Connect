pipeline {
    agent any
    
    environment {
        // Docker Configuration
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_IMAGE = 'pranavtomar1/orgconnect'  // Hardcoded since credential was causing issues
        IMAGE_TAG = "${BUILD_NUMBER}"
        
        // Kubernetes Configuration - Jenkins user already has kubectl configured
        NAMESPACE = 'orgconnect'
        APP_NAME = 'orgconnect'
        
        // Health Check Configuration
        HEALTH_CHECK_RETRIES = 5
        HEALTH_CHECK_DELAY = 10
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from repository...'
                checkout scm
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker image: ${DOCKER_IMAGE}:${IMAGE_TAG}"
                    sh """
                        docker build -t ${DOCKER_IMAGE}:${IMAGE_TAG} .
                        docker tag ${DOCKER_IMAGE}:${IMAGE_TAG} ${DOCKER_IMAGE}:latest
                    """
                }
            }
        }
        
        stage('Push to Registry') {
            steps {
                script {
                    echo "Pushing Docker image to registry..."
                    withCredentials([usernamePassword(credentialsId: 'docker-credentials', 
                                                      usernameVariable: 'DOCKER_USER', 
                                                      passwordVariable: 'DOCKER_PASS')]) {
                        sh """
                            echo "\${DOCKER_PASS}" | docker login -u "\${DOCKER_USER}" --password-stdin ${DOCKER_REGISTRY}
                            docker push ${DOCKER_IMAGE}:${IMAGE_TAG}
                            docker push ${DOCKER_IMAGE}:latest
                        """
                    }
                }
            }
        }
        
        stage('Determine Active Environment') {
            steps {
                script {
                    echo "Determining current active environment..."
                    def activeVersion = sh(
                        script: """
                            kubectl get service ${APP_NAME}-active -n ${NAMESPACE} \
                            -o jsonpath='{.spec.selector.version}' 2>/dev/null || echo 'blue'
                        """,
                        returnStdout: true
                    ).trim()
                    
                    env.CURRENT_ACTIVE = activeVersion
                    env.TARGET_ENV = (activeVersion == 'blue') ? 'green' : 'blue'
                    
                    echo "Current active environment: ${env.CURRENT_ACTIVE}"
                    echo "Target deployment environment: ${env.TARGET_ENV}"
                }
            }
        }
        
        stage('Deploy to Target Environment') {
            steps {
                script {
                    echo "Deploying to ${env.TARGET_ENV} environment..."
                    
                    // Deploy using sed to replace image placeholder
                    sh """
                        sed "s|\\\${DOCKER_IMAGE}:\\\${IMAGE_TAG}|${DOCKER_IMAGE}:${IMAGE_TAG}|g" \
                        k8s/deployment-${env.TARGET_ENV}.yaml | kubectl apply -f -
                        
                        kubectl apply -f k8s/service-${env.TARGET_ENV}.yaml
                    """
                    
                    // Wait for deployment to be ready
                    echo "Waiting for ${env.TARGET_ENV} deployment to be ready..."
                    sh """
                        kubectl rollout status deployment/${APP_NAME}-${env.TARGET_ENV} \
                        -n ${NAMESPACE} --timeout=5m
                    """
                }
            }
        }
        
        stage('Health Check on Target') {
            steps {
                script {
                    echo "Performing health checks on ${env.TARGET_ENV} environment..."
                    
                    def healthCheckPassed = false
                    for (int i = 1; i <= env.HEALTH_CHECK_RETRIES.toInteger(); i++) {
                        try {
                            echo "Health check attempt ${i}/${env.HEALTH_CHECK_RETRIES}..."
                            
                            // Check if pods are running
                            def podStatus = sh(
                                script: """
                                    kubectl get pods -n ${NAMESPACE} \
                                    -l app=${APP_NAME},version=${env.TARGET_ENV} \
                                    -o jsonpath='{.items[*].status.phase}' | grep -c 'Running' || echo '0'
                                """,
                                returnStdout: true
                            ).trim()
                            
                            if (podStatus.toInteger() >= 1) {
                                // Test the service endpoint
                                sh """
                                    kubectl run health-check-pod-${BUILD_NUMBER} \
                                    --image=curlimages/curl:latest \
                                    --restart=Never \
                                    -n ${NAMESPACE} \
                                    --rm -i --timeout=30s \
                                    -- curl -f http://${APP_NAME}-${env.TARGET_ENV}.${NAMESPACE}.svc.cluster.local/health
                                """
                                healthCheckPassed = true
                                echo "Health check passed!"
                                break
                            }
                        } catch (Exception e) {
                            echo "Health check failed: ${e.message}"
                            if (i < env.HEALTH_CHECK_RETRIES.toInteger()) {
                                echo "Retrying in ${env.HEALTH_CHECK_DELAY} seconds..."
                                sleep(env.HEALTH_CHECK_DELAY.toInteger())
                            }
                        }
                    }
                    
                    if (!healthCheckPassed) {
                        error("Health check failed after ${env.HEALTH_CHECK_RETRIES} attempts. Aborting deployment.")
                    }
                }
            }
        }
        
        stage('Switch Traffic') {
            steps {
                script {
                    echo "Switching traffic from ${env.CURRENT_ACTIVE} to ${env.TARGET_ENV}..."
                    
                    // Update the active service selector to point to target environment
                    sh """
                        kubectl patch service ${APP_NAME}-active -n ${NAMESPACE} \
                        -p '{"spec":{"selector":{"version":"${env.TARGET_ENV}"}}}'
                    """
                    
                    echo "Traffic successfully switched to ${env.TARGET_ENV}!"
                    
                    // Wait a bit for traffic to stabilize
                    sleep(10)
                    
                    // Verify the switch
                    def newActive = sh(
                        script: """
                            kubectl get service ${APP_NAME}-active -n ${NAMESPACE} \
                            -o jsonpath='{.spec.selector.version}'
                        """,
                        returnStdout: true
                    ).trim()
                    
                    if (newActive != env.TARGET_ENV) {
                        error("Traffic switch verification failed! Expected ${env.TARGET_ENV}, got ${newActive}")
                    }
                    
                    echo "Traffic switch verified. Now serving from ${env.TARGET_ENV} environment."
                }
            }
        }
        
        stage('Post-Deployment Verification') {
            steps {
                script {
                    echo "Performing post-deployment verification..."
                    
                    // Monitor for a short period
                    sleep(10)
                    
                    // Check if new environment is stable
                    sh """
                        kubectl get pods -n ${NAMESPACE} -l app=${APP_NAME},version=${env.TARGET_ENV}
                    """
                    
                    echo "Post-deployment verification completed successfully!"
                }
            }
        }
        
        stage('Scale Down Old Environment') {
            steps {
                script {
                    echo "Scaling down old ${env.CURRENT_ACTIVE} environment..."
                    
                    // Scale down to 0 (keeps deployment for quick rollback)
                    sh """
                        kubectl scale deployment/${APP_NAME}-${env.CURRENT_ACTIVE} \
                        -n ${NAMESPACE} --replicas=0
                    """
                    
                    echo "Old environment scaled down. Deployment complete!"
                }
            }
        }
    }
    
    post {
        success {
            echo """
            ========================================
            DEPLOYMENT SUCCESSFUL
            ========================================
            Build Number: ${BUILD_NUMBER}
            Docker Image: ${DOCKER_IMAGE}:${IMAGE_TAG}
            Active Environment: ${env.TARGET_ENV}
            Previous Environment: ${env.CURRENT_ACTIVE}
            ========================================
            """
        }
        
        failure {
            echo """
            ========================================
            DEPLOYMENT FAILED
            ========================================
            Build Number: ${BUILD_NUMBER}
            Failed Stage: Check console output
            ========================================
            Initiating rollback procedure...
            """
            
            script {
                // Rollback: switch back to previous environment if traffic was switched
                try {
                    if (env.TARGET_ENV && env.CURRENT_ACTIVE) {
                        echo "Rolling back to ${env.CURRENT_ACTIVE} environment..."
                        sh """
                            kubectl patch service ${APP_NAME}-active -n ${NAMESPACE} \
                            -p '{"spec":{"selector":{"version":"${env.CURRENT_ACTIVE}"}}}'
                            
                            kubectl scale deployment/${APP_NAME}-${env.CURRENT_ACTIVE} \
                            -n ${NAMESPACE} --replicas=2 || true
                        """
                        echo "Rollback completed. Traffic restored to ${env.CURRENT_ACTIVE}."
                    }
                } catch (Exception e) {
                    echo "Rollback failed: ${e.message}"
                }
            }
        }
        
        always {
            echo "Cleaning up..."
            sh """
                docker system prune -f || true
                kubectl delete pod health-check-pod-${BUILD_NUMBER} -n ${NAMESPACE} 2>/dev/null || true
            """
        }
    }
}
