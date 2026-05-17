/* ***********************
 * controllers/categoriesController.js
 *
 * Handles the Categories view.
 * Separated into its own file to follow the course naming convention:
 *   one controller per resource/feature area.
 *
 * Week 2 will query a database for category data and likely add
 * buildCategoryDetail() to show organizations within a category.
 * *********************** */

const buildCategories = async (req, res, next) => {
  try {
    // Placeholder data per the assignment specification.
    // Week 2 replaces this with: const categories = await categoriesModel.getAll()
    const categories = [
      {
        name: 'Environmental',
        description:
          'Technology solutions for environmental conservation, climate monitoring, and sustainable practices.',
        cssClass: 'category--environmental',
      },
      {
        name: 'Educational',
        description:
          'Digital tools and open platforms that expand access to quality education worldwide.',
        cssClass: 'category--educational',
      },
      {
        name: 'Community Service',
        description:
          'Technology that strengthens local communities, social services, and civic engagement.',
        cssClass: 'category--community',
      },
      {
        name: 'Health and Wellness',
        description:
          'Innovations in healthcare technology, telehealth, and mental wellness support.',
        cssClass: 'category--health',
      },
    ]
    res.render('categories', { title: 'Categories', categories })
  } catch (err) {
    next(err)
  }
}

export { buildCategories }
