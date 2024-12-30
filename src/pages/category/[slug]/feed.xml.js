import { urlifyToken, sortedPosts } from '@/js/util.js'
import { SITE_TITLE } from '@/config.ts'
import menuData from "@/config/main-menu.yaml";
import { getCollection } from 'astro:content';
import { buildFeed } from '@/utils/rss.js';

// Helper to create a dynamic category map from menuData
export const buildCategoryMap = (menuData) => {
  console.log(menuData.menu)
  const map = {};

  menuData.menu.forEach((item) => {
    const parentSlug = urlifyToken(item.title); // Convert title to slug
    map[parentSlug] = [parentSlug]; // Include the parent category itself

    if (item.submenu) {
      item.submenu.forEach((subItem) => {
        const childSlug = urlifyToken(subItem.title); // Convert child title to slug
        map[parentSlug].push(childSlug); // Add child categories to the parent's group
      });
    }
  });

  return map;
};

// Build the category map dynamically
export const categoryMap = buildCategoryMap(menuData);

export async function getStaticPaths() {
  const posts = sortedPosts(await getCollection('posts'));

  // Build category map dynamically from menuData
  const categoryMap = buildCategoryMap(menuData);

  // Ensure all categories from menuData are included in the category list
  const allCategories = new Set(Object.keys(categoryMap));

  // Add categories from posts
  posts.forEach((post) => {
    post.data.categories?.map(urlifyToken).forEach((category) => {
      allCategories.add(category);

      // Ensure subcategories are mapped to their parents dynamically
      for (const [parent, children] of Object.entries(categoryMap)) {
        if (children.includes(category)) {
          allCategories.add(parent);
        }
      }
    });
  });

  // Generate paths for all categories
  return Array.from(allCategories).map((cat) => {
    const includedCategories = categoryMap[cat] || [cat]; // Include subcategories if available
    const categoryPosts = posts.filter((post) =>
      post.data.categories?.map(urlifyToken).some((c) => includedCategories.includes(c))
    );

    return {
      params: { slug: cat },
      props: {
        posts: categoryPosts,
        category: menuData.menu.find(
          (item) => urlifyToken(item.title) === cat || item.submenu?.some((sub) => urlifyToken(sub.title) === cat)
        )?.title || cat, // Find the category title dynamically
      },
    };
  });
}

export async function GET (context) {
  const description = `Posts from the ‘${context.props.category}’ category`;

  return await buildFeed(`${context.props.category} | ${SITE_TITLE}`, description, context.site, context.request.url, context.props.posts);
}
