# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | :white_check_mark: |
| 1.x.x   | :x:                |

## Reporting a Vulnerability

We take the security of Code Snippet Manager seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do Not Publicly Disclose

Please **do not** create a public GitHub issue for security vulnerabilities.

### 2. Report Privately

Send a detailed report to us through one of these channels:

- **GitHub Security Advisories**: Use the "Report a vulnerability" button in the Security tab
- **Private Issue**: Create a private security advisory in the repository

### 3. Include Details

Your report should include:

- **Description** of the vulnerability
- **Steps to reproduce** the issue
- **Potential impact** of the vulnerability
- **Suggested fix** (if you have one)

### 4. Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Resolution**: Depends on severity (see below)

## Severity Levels

| Severity | Description | Response Time |
|----------|-------------|---------------|
| Critical | Remote code execution, data breach | 24-48 hours |
| High | Authentication bypass, data exposure | 7 days |
| Medium | Limited data exposure, DoS | 30 days |
| Low | Minor issues, hardening | 90 days |

## Security Best Practices

### For Users

1. **Use strong passwords** - Minimum 12 characters with mixed case, numbers, and symbols
2. **Keep your instance updated** - Apply security patches promptly
3. **Use HTTPS** - Always deploy with TLS/SSL enabled
4. **Secure your JWT secret** - Use a long, random string for `JWT_SECRET`

### For Self-Hosted Deployments

```env
# Generate a secure JWT secret
JWT_SECRET=$(openssl rand -hex 32)

# Use environment variables for sensitive data
# Never commit secrets to version control
```

### For Contributors

1. **Never commit secrets** - Use environment variables
2. **Validate all inputs** - Sanitize user input on both client and server
3. **Use parameterized queries** - Prevent SQL injection
4. **Implement rate limiting** - Prevent brute force attacks
5. **Keep dependencies updated** - Regularly update npm and pip packages

## Known Security Considerations

### Authentication

- JWT tokens expire after 24 hours
- Refresh tokens expire after 30 days
- Passwords are hashed using bcrypt

### Data Storage

- SQLite database is stored locally
- No data is transmitted to third parties
- User passwords are never stored in plain text

### API Security

- CORS is configured for specific origins
- Rate limiting should be implemented for production
- All sensitive endpoints require authentication

## Security Updates

Security updates will be announced through:

- GitHub Security Advisories
- Release notes
- README updates

## Acknowledgments

We appreciate responsible disclosure and will acknowledge security researchers who:

- Follow this security policy
- Give us reasonable time to fix issues
- Do not exploit vulnerabilities

Thank you for helping keep Code Snippet Manager secure!
