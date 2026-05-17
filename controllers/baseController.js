/* ***********************
 * controllers/baseController.js
 *
 * Handles Home, Organizations, and Projects views.
 *
 * Controller pattern:
 *   1. Receive the request (what the browser asked for)
 *   2. Gather/prepare any data the view needs
 *   3. Call res.render(viewName, dataObject) — EJS merges data into the template
 *   4. On failure, call next(err) to reach the global error handler in server.js
 *
 * Week 2 will replace hardcoded data arrays with database queries.
 * *********************** */

const buildHome = async (req, res, next) => {
  try {
    res.render('home', { title: 'Home' })
  } catch (err) {
    next(err)
  }
}

const buildOrganizations = async (req, res, next) => {
  try {
    // Hardcoded for Week 1. Week 2 replaces this with a database query.
    const organizations = [
      {
        id: 1,
        name: 'Code for Change',
        description:
          'Building open-source software solutions that help nonprofits and underserved communities operate more effectively.',
        image: '/images/code-for-change.svg',
        alt: 'Code for Change logo — code angle brackets with a heart',
      },
      {
        id: 2,
        name: 'Digital Equity Now',
        description:
          'Closing the digital divide by providing internet access, refurbished devices, and digital-literacy training.',
        image: '/images/digital-equity.svg',
        alt: 'Digital Equity Now logo — three connected network nodes',
      },
      {
        id: 3,
        name: 'Green Tech Alliance',
        description:
          'Developing technology solutions that address environmental challenges — from smart energy grids to reforestation tracking.',
        image: '/images/green-tech.svg',
        alt: 'Green Tech Alliance logo — a leaf with circuit-board lines',
      },
      {
        id: 4,
        name: 'HealthTech Access',
        description:
          'Making life-saving medical technology and telehealth services accessible to communities in low-resource settings.',
        image: '/images/healthtech-access.svg',
        alt: 'HealthTech Access logo — a heartbeat line with a medical cross',
      },
    ]
    res.render('organizations', { title: 'Organizations', organizations })
  } catch (err) {
    next(err)
  }
}

const buildProjects = async (req, res, next) => {
  try {
    res.render('projects', { title: 'Projects' })
  } catch (err) {
    next(err)
  }
}

export { buildHome, buildOrganizations, buildProjects }
