const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  try {
    const tagData = await Tag.findAll({
      include: [{ model: Product }],
    });
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try {
    const tagData = await Tag.findByPk(req.params.id, {
      include: [{ model: Product }],
    });
    if (!tagData) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', (req, res) => {
  // create a new tag
  Tag.create(req.body)
    .then((tag) => {
      res.status(201).json(tag);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

router.put('/:id', (req, res) => {
  // update a tag's name by its `id` value
  Tag.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((tag) => {
      if (req.body.productIds && req.body.productIds.length) {
        ProductTag.findAll({
          where: { tag_id: req.params.id }
        }).then((tag) => {
          const tagIds = tag.map(({ product_id }) => product_id);
          const newTagIds = req.body.productIds
            .filter((product_id) => !tagIds.includes(product_id))
            .map((product_id) => {
              return {
                product_id,
                tag_id: req.params.id,
              };
            });
          const tagIdsToRemove = tag
            .filter(({ product_id }) => !req.body.productIds.includes(product_id))
            .map(({ id }) => id);

          return Promise.all([
            ProductTag.destroy({ where: { id: tagIdsToRemove } }),
            ProductTag.bulkCreate(newTagIds),
          ]);
        })
      }
      return res.json(tag);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  // delete one tag by its `id` value
  Tag.destroy({
    where: {
      id: req.params.id,
    },
  })
    .then((deletedTag) => {
      res.json(deletedTag);
    })
    .catch((err) => res.json(err));
});

module.exports = router;
