export const serviceDependencies = {
    'auth-service': ['redis'],
    'nginx': ['auth-service']
}