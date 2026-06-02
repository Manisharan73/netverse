const serviceDependencies = {
    'HTTP': ['DNS', 'DB'],
    'HTTPS': ['DNS', 'DB'],
    'SSH': [],
    'FTP': [],
    'DNS': [],
    'DB': [],
    'Docker': []
}

module.exports = {
    serviceDependencies
}
