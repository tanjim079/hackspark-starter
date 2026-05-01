let cachedCategories = null;

const setCategories = (data) => {
    cachedCategories = data;
};

const getCategories = () => cachedCategories;

module.exports = { setCategories, getCategories };