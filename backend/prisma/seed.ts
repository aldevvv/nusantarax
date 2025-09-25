import { prisma } from '../lib/prisma';

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create subscription plans
  const plans = [
    {
      name: 'FREE',
      displayName: 'Free Plan',
      description: 'Perfect for getting started with basic features',
      monthlyRequests: 50,
      monthlyPrice: 0,
      yearlyPrice: 0,
      isActive: true,
      sortOrder: 0,
      trialDays: 0, // Admin will configure trial via TrialConfiguration
    },
    {
      name: 'BASIC',
      displayName: 'Basic Plan',
      description: 'Ideal for small projects and individual developers',
      monthlyRequests: 750,
      monthlyPrice: 99000, // Rp 99,000
      yearlyPrice: 990000, // Rp 990,000 (2 months free)
      isActive: true,
      sortOrder: 1,
      trialDays: 0, // Admin will configure trial via TrialConfiguration
    },
    {
      name: 'PRO',
      displayName: 'Pro Plan',
      description: 'Best for growing businesses and teams',
      monthlyRequests: 5000,
      monthlyPrice: 299000, // Rp 299,000
      yearlyPrice: 2990000, // Rp 2,990,000 (2 months free)
      isActive: true,
      sortOrder: 2,
      trialDays: 0, // Admin will configure trial via TrialConfiguration
    },
    {
      name: 'ENTERPRISE',
      displayName: 'Enterprise Plan',
      description: 'Custom solutions for large organizations',
      monthlyRequests: -1, // Unlimited
      monthlyPrice: 999000, // Rp 999,000
      yearlyPrice: 9990000, // Rp 9,990,000 (2 months free)
      isActive: true,
      sortOrder: 3,
      trialDays: 0, // Admin will configure trial via TrialConfiguration
    },
  ];

  console.log('📋 Creating subscription plans...');
  
  for (const planData of plans) {
    const existingPlan = await prisma.subscriptionPlan.findUnique({
      where: { name: planData.name },
    });

    if (existingPlan) {
      console.log(`✅ Plan ${planData.name} already exists, skipping...`);
    } else {
      const plan = await prisma.subscriptionPlan.create({
        data: planData,
      });
      console.log(`✅ Created plan: ${plan.displayName}`);
    }
  }

  // Create image templates
  const imageTemplates = [
    // Food & Beverage Templates
    {
      name: 'Traditional Food Showcase',
      description: 'Professional template for showcasing traditional Indonesian food products',
      category: 'Food & Beverage',
      subCategory: 'Traditional Food',
      promptTemplate: 'Create a professional product photo of {productName}, a traditional Indonesian {subCategory}. {description}. Style: {style}. Background: {backgroundPreference}. Served: {servingStyle}. High-quality commercial photography, appetizing presentation.',
      requiredFields: JSON.stringify([
        { name: 'productName', type: 'text', label: 'Product Name', required: true },
        { name: 'description', type: 'textarea', label: 'Product Description', required: true },
        { name: 'style', type: 'select', label: 'Style', options: ['Modern', 'Vintage', 'Minimalist', 'Elegant', 'Playful'], required: true },
        { name: 'backgroundPreference', type: 'select', label: 'Background', options: ['White', 'Transparent', 'Colorful', 'Natural', 'Studio'], required: true },
        { name: 'servingStyle', type: 'select', label: 'Serving Style', options: ['Plated', 'Raw', 'Packaged'], required: false }
      ]),
      exampleImage: 'https://jddprxvislcohnbexwnx.supabase.co/storage/v1/object/public/generated-images/cmftz42c100013uoctsaawkxd/2025/09/img-gen-cmfuwch7k00073u309a088oj3-1-1758531771259.png',
      isActive: true,
      sortOrder: 1
    },
    {
      name: 'Premium Cakes & Desserts',
      description: 'Specialized template for cakes and desserts with attractive presentation',
      category: 'Food & Beverage',
      subCategory: 'Cakes & Desserts',
      promptTemplate: 'Create a professional product photo of {productName}, a delicious {subCategory}. {description}. Style: {style}. Background: {backgroundPreference}. Served: {servingStyle}. Studio lighting, mouth-watering presentation, commercial bakery photography.',
      requiredFields: JSON.stringify([
        { name: 'productName', type: 'text', label: 'Product Name', required: true },
        { name: 'description', type: 'textarea', label: 'Product Description', required: true },
        { name: 'style', type: 'select', label: 'Style', options: ['Modern', 'Vintage', 'Minimalist', 'Elegant', 'Playful'], required: true },
        { name: 'backgroundPreference', type: 'select', label: 'Background', options: ['White', 'Transparent', 'Colorful', 'Natural', 'Studio'], required: true },
        { name: 'servingStyle', type: 'select', label: 'Serving Style', options: ['Plated', 'Raw', 'Packaged'], required: false }
      ]),
      exampleImage: 'https://jddprxvislcohnbexwnx.supabase.co/storage/v1/object/public/generated-images/cmftz42c100013uoctsaawkxd/2025/09/img-gen-cmfux5zwb001d3u30c6y489ne-2-1758533281837.png',
      isActive: true,
      sortOrder: 2
    },

    // Fashion & Apparel Templates
    {
      name: 'Fashion Product Studio',
      description: 'Professional template for fashion products with studio-quality presentation',
      category: 'Fashion & Apparel',
      subCategory: 'Men\'s Clothing',
      promptTemplate: 'Create a professional fashion product photo of {productName}, a {subCategory} for {targetGender}. {description}. Style: {style}. Occasion: {occasion}. Background: {backgroundPreference}. Studio lighting, fashion photography, commercial quality.',
      requiredFields: JSON.stringify([
        { name: 'productName', type: 'text', label: 'Product Name', required: true },
        { name: 'description', type: 'textarea', label: 'Product Description', required: true },
        { name: 'style', type: 'select', label: 'Style', options: ['Modern', 'Vintage', 'Minimalist', 'Elegant', 'Playful'], required: true },
        { name: 'backgroundPreference', type: 'select', label: 'Background', options: ['White', 'Transparent', 'Colorful', 'Natural', 'Studio'], required: true },
        { name: 'targetGender', type: 'select', label: 'Target Gender', options: ['Men', 'Women', 'Unisex'], required: true },
        { name: 'occasion', type: 'select', label: 'Occasion', options: ['Casual', 'Formal', 'Sport', 'Party', 'Work'], required: false }
      ]),
      exampleImage: 'https://jddprxvislcohnbexwnx.supabase.co/storage/v1/object/public/generated-images/cmftz42c100013uoctsaawkxd/2025/09/img-gen-cmfuxhb5a00283u301wrg5cvm-3-1758533661124.png',
      isActive: true,
      sortOrder: 3
    },
    {
      name: 'Fashion Accessories',
      description: 'Template for fashion accessories like bags, shoes, watches',
      category: 'Fashion & Apparel',
      subCategory: 'Accessories',
      promptTemplate: 'Create a professional product photo of {productName}, a fashionable {subCategory}. {description}. Style: {style}. Occasion: {occasion}. Background: {backgroundPreference}. Luxury product photography, detailed view, commercial quality.',
      requiredFields: JSON.stringify([
        { name: 'productName', type: 'text', label: 'Product Name', required: true },
        { name: 'description', type: 'textarea', label: 'Product Description', required: true },
        { name: 'style', type: 'select', label: 'Style', options: ['Modern', 'Vintage', 'Minimalist', 'Elegant', 'Playful'], required: true },
        { name: 'backgroundPreference', type: 'select', label: 'Background', options: ['White', 'Transparent', 'Colorful', 'Natural', 'Studio'], required: true },
        { name: 'targetGender', type: 'select', label: 'Target Gender', options: ['Men', 'Women', 'Unisex'], required: false },
        { name: 'occasion', type: 'select', label: 'Occasion', options: ['Casual', 'Formal', 'Sport', 'Party', 'Work'], required: false }
      ]),
      exampleImage: 'https://jddprxvislcohnbexwnx.supabase.co/storage/v1/object/public/generated-images/cmftz42c100013uoctsaawkxd/2025/09/img-gen-cmfuxlw0v002q3u30htudwt30-2-1758533862059.png',
      isActive: true,
      sortOrder: 4
    },

    // Technology Templates
    {
      name: 'Tech Product Showcase',
      description: 'Template for technology products like gadgets and accessories',
      category: 'Technology',
      subCategory: 'Smartphone',
      promptTemplate: 'Create a professional technology product photo of {productName}, a {subCategory}. {description}. Style: {style}. Background: {backgroundPreference}. Focus on modern, sleek appearance. Tech category: {techCategory}. High-tech commercial photography.',
      requiredFields: JSON.stringify([
        { name: 'productName', type: 'text', label: 'Product Name', required: true },
        { name: 'description', type: 'textarea', label: 'Product Description', required: true },
        { name: 'style', type: 'select', label: 'Style', options: ['Modern', 'Futuristic', 'Minimalist', 'Industrial', 'Clean'], required: true },
        { name: 'backgroundPreference', type: 'select', label: 'Background', options: ['White', 'Black', 'Gradient', 'Tech', 'Studio'], required: true },
        { name: 'techCategory', type: 'select', label: 'Tech Category', options: ['Mobile', 'Computing', 'Audio', 'Gaming', 'Smart Home'], required: false }
      ]),
      exampleImage: 'https://jddprxvislcohnbexwnx.supabase.co/storage/v1/object/public/generated-images/cmftz42c100013uoctsaawkxd/2025/09/img-gen-cmfuxq8mz00383u30b9f24w9c-1-1758534073830.png',
      isActive: true,
      sortOrder: 5
    },

    // Health & Beauty Templates
    {
      name: 'Beauty Product Elegant',
      description: 'Template for beauty and skincare products',
      category: 'Health & Beauty',
      subCategory: 'Skincare',
      promptTemplate: 'Create a professional beauty product photo of {productName}, a {subCategory} product. {description}. Benefits: {benefits}. Style: {style}. Background: {backgroundPreference}. Target skin: {targetSkin}. Luxury cosmetics photography.',
      requiredFields: JSON.stringify([
        { name: 'productName', type: 'text', label: 'Product Name', required: true },
        { name: 'description', type: 'textarea', label: 'Product Description', required: true },
        { name: 'style', type: 'select', label: 'Style', options: ['Modern', 'Luxury', 'Minimalist', 'Natural', 'Clinical'], required: true },
        { name: 'backgroundPreference', type: 'select', label: 'Background', options: ['White', 'Soft', 'Natural', 'Gradient', 'Marble'], required: true },
        { name: 'targetSkin', type: 'select', label: 'Target Skin Type', options: ['Normal', 'Dry', 'Oily', 'Sensitive', 'All Types'], required: false },
        { name: 'benefits', type: 'text', label: 'Key Benefits', required: false }
      ]),
      exampleImage: 'https://jddprxvislcohnbexwnx.supabase.co/storage/v1/object/public/generated-images/cmftz42c100013uoctsaawkxd/2025/09/img-gen-cmfuxutfz003q3u30fd3w848d-2-1758534253892.png',
      isActive: true,
      sortOrder: 6
    }
  ];

  console.log('🖼️ Creating image templates...');
  
  for (const templateData of imageTemplates) {
    const existingTemplate = await prisma.imageTemplate.findFirst({
      where: {
        name: templateData.name,
        category: templateData.category
      },
    });

    if (existingTemplate) {
      console.log(`✅ Template ${templateData.name} already exists, skipping...`);
    } else {
      const template = await prisma.imageTemplate.create({
        data: templateData,
      });
      console.log(`✅ Created template: ${template.name}`);
    }
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });