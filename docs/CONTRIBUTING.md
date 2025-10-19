# Contributing Guide

Thank you for your interest in contributing to the Statsbudsjettet project! This guide will help you get started with contributing to the Norwegian State Budget visualization platform.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Code Style Guidelines](#code-style-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)
- [Documentation](#documentation)

## 🚀 Getting Started

### Prerequisites
- Basic knowledge of HTML, CSS, and JavaScript
- Understanding of Norwegian government budget structure
- Git and GitHub familiarity
- Local development environment

### Fork and Clone
1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/yourusername/budget.git
   cd budget
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/egil10/budget.git
   ```

### Development Workflow
1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes**
3. **Test thoroughly**
4. **Commit with descriptive messages**
5. **Push to your fork**
6. **Create a pull request**

## 🛠️ Development Setup

### Local Environment
```bash
# Navigate to project directory
cd budget

# Start development server
python -m http.server 8000

# Access at http://localhost:8000
```

### Data Updates
When adding new budget data:
```bash
# Add Excel files to data/excel/
# Run conversion script
python scripts/excel_to_json.py

# Verify JSON files are created in data/json/
```

### Testing
- **Browser Testing**: Test in Chrome, Firefox, Safari, Edge
- **Mobile Testing**: Test on various screen sizes
- **Data Validation**: Verify chart accuracy with source data
- **Performance Testing**: Check loading times and responsiveness

## 📝 Code Style Guidelines

### JavaScript
```javascript
// Use meaningful variable names
const budgetData = loadBudgetData();
const departmentTotals = calculateTotals(data);

// Add comments for complex logic
// Merge OLJE- OG ENERGIDEPARTEMENTET with Energidepartementet
budgetData['2024'] = budgetData['2024'].map(item => ({
    ...item,
    fdep_navn: item.fdep_navn === 'Olje- og energidepartementet' ? 
               'Energidepartementet' : item.fdep_navn
}));

// Use consistent formatting
function createHTMLChart(container, amount2024, amount2025, amount2026, label) {
    // Function implementation
}
```

### CSS
```css
/* Use descriptive class names */
.budget-card {
    /* Card styling */
}

.budget-card-header {
    /* Header styling */
}

/* Use consistent spacing */
.margin-top-1 { margin-top: 1rem; }
.margin-bottom-2 { margin-bottom: 2rem; }

/* Mobile-first responsive design */
@media (max-width: 768px) {
    .budget-card {
        min-height: 280px;
    }
}
```

### HTML
```html
<!-- Use semantic HTML -->
<section class="department-section">
    <header class="department-header">
        <h2>Department Name</h2>
    </header>
    <div class="department-grid">
        <!-- Department cards -->
    </div>
</section>

<!-- Include accessibility attributes -->
<button class="download-btn" 
        title="Download as HTML"
        aria-label="Download budget card">
    <!-- SVG icon -->
</button>
```

## 🔄 Pull Request Process

### Before Submitting
1. **Test your changes thoroughly**
2. **Ensure code follows style guidelines**
3. **Update documentation if needed**
4. **Check for console errors**
5. **Verify mobile compatibility**

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Data update
- [ ] Performance improvement

## Testing
- [ ] Tested in multiple browsers
- [ ] Tested on mobile devices
- [ ] Verified data accuracy
- [ ] No console errors

## Screenshots (if applicable)
Add screenshots to help explain your changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

### Review Process
1. **Automated checks** pass
2. **Code review** by maintainers
3. **Testing** on various devices
4. **Approval** and merge

## 🐛 Issue Reporting

### Bug Reports
When reporting bugs, include:

```markdown
## Bug Description
Clear description of the issue

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- Browser: [e.g., Chrome 95]
- Device: [e.g., Desktop, Mobile]
- OS: [e.g., Windows 10, macOS 12]

## Screenshots
Add screenshots if applicable

## Console Errors
Copy any console error messages
```

### Feature Requests
For new features:

```markdown
## Feature Description
Clear description of the requested feature

## Use Case
Why would this feature be useful?

## Proposed Solution
How should this feature work?

## Alternatives Considered
Other ways to solve the problem

## Additional Context
Any other relevant information
```

## 🎯 Feature Requests

### Current Roadmap
- Enhanced filtering options
- Export functionality improvements
- Performance optimizations
- Accessibility enhancements
- Mobile app development

### Suggested Contributions
- **Data Visualization**: New chart types, better animations
- **User Experience**: Improved navigation, better mobile experience
- **Performance**: Faster loading, better caching
- **Accessibility**: Screen reader support, keyboard navigation
- **Documentation**: Better guides, tutorials

## 📚 Documentation

### Code Documentation
- **Function comments**: Explain complex logic
- **API documentation**: Document public functions
- **README updates**: Keep setup instructions current

### User Documentation
- **Feature guides**: How to use new features
- **Troubleshooting**: Common issues and solutions
- **FAQ**: Frequently asked questions

### Examples
```javascript
/**
 * Creates an SVG chart for budget trend visualization
 * @param {HTMLElement} container - DOM element to render chart into
 * @param {number} amount2024 - Budget amount for 2024
 * @param {number} amount2025 - Budget amount for 2025
 * @param {number} amount2026 - Budget amount for 2026
 * @param {string} label - Chart title/label
 * @returns {SVGElement} The created SVG chart element
 */
function createHTMLChart(container, amount2024, amount2025, amount2026, label) {
    // Implementation
}
```

## 🧪 Testing Guidelines

### Manual Testing Checklist
- [ ] **Functionality**: All features work as expected
- [ ] **Responsiveness**: Layout adapts to different screen sizes
- [ ] **Performance**: Page loads quickly, charts render smoothly
- [ ] **Accessibility**: Keyboard navigation, screen reader compatibility
- [ ] **Data Accuracy**: Charts match source data
- [ ] **Cross-browser**: Works in Chrome, Firefox, Safari, Edge

### Automated Testing (Future)
Consider adding:
- Unit tests for utility functions
- Integration tests for data loading
- Visual regression tests for charts
- Performance tests for loading times

## 🎨 Design Guidelines

### Visual Consistency
- **Colors**: Use established color scheme (green/red for trends)
- **Typography**: Maintain consistent font usage
- **Spacing**: Follow established spacing patterns
- **Layout**: Use grid-based layouts

### Norwegian Government Standards
- **Language**: Use Norwegian terms where appropriate
- **Accessibility**: Follow WCAG guidelines
- **Design**: Maintain professional government appearance
- **Data Presentation**: Clear, accurate budget information

## 🔒 Security Considerations

### Data Handling
- **No sensitive data**: Only public budget information
- **Client-side processing**: No server-side data storage
- **Input validation**: Validate all user inputs
- **XSS prevention**: Sanitize any dynamic content

### Best Practices
- **HTTPS only**: Always use secure connections
- **Content Security Policy**: Implement CSP headers
- **Regular updates**: Keep dependencies current
- **Security headers**: Use appropriate security headers

## 📞 Getting Help

### Communication Channels
- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **Pull Request Comments**: For code review discussions

### Response Times
- **Bug reports**: Within 48 hours
- **Feature requests**: Within 1 week
- **Pull requests**: Within 3-5 business days
- **Questions**: Within 2-3 days

## 🏆 Recognition

### Contributors
Contributors will be recognized in:
- **README.md**: Contributor list
- **Release notes**: Feature acknowledgments
- **GitHub**: Contributor statistics

### Types of Contributions
- **Code**: Bug fixes, new features, improvements
- **Documentation**: Guides, tutorials, API docs
- **Design**: UI/UX improvements, accessibility
- **Data**: Budget data updates, validation
- **Testing**: Bug reports, quality assurance

---

Thank you for contributing to the Statsbudsjettet project! Your contributions help make Norwegian budget data more accessible and understandable for everyone.

*Last updated: October 2025*
