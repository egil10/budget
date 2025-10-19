# Changelog

All notable changes to the Statsbudsjettet project will be documented in this file.

## [2025-10-19] - Major Update: 2026 Data Integration & Documentation

### Added
- **2026 Budget Data**: Full integration of 2026 budget data into the pipeline
- **3-Year Charts**: Updated all charts to display 2024, 2025, and 2026 data points
- **Comprehensive Documentation**: Complete documentation suite in `docs/` folder
- **Configuration System**: Centralized configuration in `src/js/config.js`
- **Repository Organization**: Improved file structure and organization

### Changed
- **Chart Rendering**: Updated `createHTMLChart()` to handle 3 data points
- **Data Loading**: Enhanced to load and process 2026 JSON files
- **CSS Grid Layouts**: Updated year comparison grids for 3-column layout
- **Navigation**: Enhanced mobile and desktop navigation systems
- **File Structure**: Moved favicon to `src/assets/` for better organization

### Technical Improvements
- **Performance**: Parallel data loading for better performance
- **SVG Charts**: Efficient generation of 3-point line charts
- **Responsive Design**: Enhanced mobile responsiveness
- **Error Handling**: Improved error handling and data validation
- **Memory Management**: Better cleanup and memory management

### Documentation Added
- **README.md**: Project overview and setup guide
- **API.md**: Detailed API reference and data structures
- **DEPLOYMENT.md**: Deployment options and production setup
- **CONTRIBUTING.md**: Contribution guidelines and workflow
- **DEVELOPMENT.md**: Development guide and architecture
- **CHANGELOG.md**: This changelog file

### Files Modified
- `src/js/main.js`: Updated for 2026 data integration
- `index.html`: Updated favicon path and added config script
- `src/js/config.js`: New configuration file
- `docs/`: Complete documentation suite

### Files Added
- `data/json/2026_gulbok_datagrunnlag.json`: 2026 budget data
- `src/assets/favicon.ico`: Moved favicon to assets folder
- `src/js/config.js`: Centralized configuration
- `docs/README.md`: Project documentation
- `docs/API.md`: API reference
- `docs/DEPLOYMENT.md`: Deployment guide
- `docs/CONTRIBUTING.md`: Contributing guide
- `docs/DEVELOPMENT.md`: Development guide
- `docs/CHANGELOG.md`: This changelog

### Breaking Changes
- None - all changes are backward compatible

### Migration Notes
- No migration required - all changes are additive
- Existing functionality remains unchanged
- New 2026 data is automatically integrated

## [Previous Versions]

### [2025-10-18] - Download Functionality & Chart Improvements
- Added download buttons to budget cards
- Enhanced chart sizing and responsiveness
- Improved SVG chart rendering
- Added comprehensive inline CSS for downloads

### [2025-10-17] - Department Navigation & Chart System
- Implemented department aggregation view
- Added mobile-responsive navigation
- Created pure SVG chart system
- Enhanced mobile responsiveness

### [2025-10-16] - Initial Release
- Basic budget data visualization
- 2024 and 2025 data integration
- Department filtering and navigation
- Responsive design implementation

---

*For more details about each release, see the commit history and pull requests.*
