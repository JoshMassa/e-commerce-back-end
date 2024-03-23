const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  try {
    const categoryData = await Category.findAll({
      include: [{ model: Product }],
    });
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  try {
    const categoryData = await Category.findByPk(req.params.id, {
      include: [{ model: Product }],
    });
    if (!categoryData) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(200).json(categoryData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', (req, res) => {
  // create a new category
  Category.create(req.body)
    .then((category) => {
      if (req.body.productIds) {
        const categoryIdArr = req.body.productIds.map((product_id) => {
          return {
            product_id,
            category_id: category.id,
          };
        });
        return Category.bulkCreate(categoryIdArr);
      }
      res.status(201).json(category);
    })
    .then((categoryIds) => res.status(200).json(categoryIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

router.put('/:id', (req, res) => {
  // update a category by its `id` value
  Category.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((category) => {
      if (req.body.productIds && req.body.productIds.length) {
        Category.findAll({
          where: { category_id: req.params.id }
        }).then((category) => {
          const categoryIds = category.map(({ product_id }) => product_id);
          const newCategoryIds = req.body.productIds
            .filter((product_id) => !categoryIds.includes(product_id))
            .map((product_id) => {
              return {
                product_id,
                category_id: req.params.id,
              };
            });
            const categoryIdsToRemove = category
              .filter(({ product_id }) => !req.body.productIds.includes(product_id))
              .map(({ id }) => id);

            return Promise.all([
              Category.destroy({ where: { id: categoryIdsToRemove } }),
              Category.bulkCreate(newCategoryIds),
            ]);
        })
      }
      return res.json(category);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  // delete a category by its `id` value
  Category.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((deletedCategory) => {
      res.json(deletedCategory);
    })
    .catch((err) => res.json(err));
});

module.exports = router;
