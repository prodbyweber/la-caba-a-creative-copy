import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get existing config
    const configs = await base44.asServiceRole.entities.LandingConfig.list();
    
    if (configs.length === 0) {
      return Response.json({ error: 'No landing config found' }, { status: 404 });
    }

    const config = configs[0];

    // Add brand logos if they don't exist
    const brandLogos = [
      "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop",
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=100&fit=crop",
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=100&fit=crop",
      "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=100&fit=crop",
      "https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=200&h=100&fit=crop"
    ];

    await base44.asServiceRole.entities.LandingConfig.update(config.id, {
      brand_logos: brandLogos
    });

    return Response.json({ 
      success: true,
      message: 'Brand logos added successfully'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});