# Contributing to Code Snippet Manager

First off, thank you for considering contributing to Code Snippet Manager! It's people like you that make this project better for everyone.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- Git

### Setting Up Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork**
   ```bash
   git clone https://github.com/gupta-8/code-snippet.git
   cd code-snippet
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/gupta-8/code-snippet.git
   ```

4. **Set up the backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

5. **Set up the frontend**
   ```bash
   cd frontend
   yarn install
   ```

6. **Create environment files**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Frontend
   echo "REACT_APP_BACKEND_URL=http://localhost:8001" > frontend/.env
   ```

7. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend && uvicorn server:app --reload --port 8001
   
   # Terminal 2 - Frontend
   cd frontend && yarn start
   ```

---

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**When creating a bug report, include:**

- Clear and descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Screenshots if applicable
- Environment details (OS, browser, versions)

### Suggesting Features

Feature suggestions are welcome! Please provide:

- Clear description of the feature
- Use case and benefits
- Possible implementation approach
- Mockups or examples if applicable

### Code Contributions

1. **Find an issue** to work on or create one
2. **Comment** on the issue to let others know you're working on it
3. **Create a branch** for your changes
4. **Make your changes** following our style guidelines
5. **Test your changes** thoroughly
6. **Submit a pull request**

---

## Style Guidelines

### JavaScript/React

- Use functional components with hooks
- Follow ESLint configuration
- Use meaningful variable and function names
- Add comments for complex logic

```javascript
// Good
const handleSnippetCreate = async (snippetData) => {
  try {
    const created = await snippetApi.create(snippetData);
    setSnippets(prev => [created, ...prev]);
    toast.success('Snippet created!');
  } catch (err) {
    toast.error('Failed to create snippet');
  }
};

// Avoid
const create = async (d) => {
  const c = await api.create(d);
  setS(p => [c, ...p]);
};
```

### Python/FastAPI

- Follow PEP 8 style guide
- Use type hints
- Add docstrings to functions

```python
# Good
async def create_snippet(
    data: SnippetCreate,
    session: AsyncSession = Depends(get_session),
    user: User = Depends(require_auth)
) -> SnippetResponse:
    """Create a new code snippet for the authenticated user."""
    snippet = Snippet(
        id=str(uuid.uuid4()),
        title=data.title,
        code=data.code,
        user_id=user.id
    )
    session.add(snippet)
    await session.commit()
    return snippet.to_dict()
```

### CSS/Tailwind

- Use Tailwind utility classes
- Follow mobile-first approach
- Use CSS variables for theming

```jsx
// Good
<button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
  Submit
</button>
```

---

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(snippets): add folder organization feature

fix(auth): resolve token refresh issue on page reload

docs(readme): update deployment instructions

style(sidebar): improve mobile responsiveness
```

---

## Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Ensure all tests pass**
4. **Update the README** if adding new features
5. **Request review** from maintainers

### PR Title Format

```
[Type] Brief description
```

Examples:
- `[Feature] Add folder color customization`
- `[Fix] Resolve dark mode contrast issues`
- `[Docs] Update API documentation`

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added unit tests
- [ ] Updated documentation

## Screenshots (if applicable)

## Related Issues
Closes #123
```

---

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

---

## Questions?

Feel free to:
- Open a [Discussion](https://github.com/gupta-8/code-snippet/discussions)
- Create an [Issue](https://github.com/gupta-8/code-snippet/issues)

Thank you for contributing! 🎉
