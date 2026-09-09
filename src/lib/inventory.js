import Product from '@/models/Product';
import Offer from '@/models/Offer';

export async function reduceStock(items) {
  for (const item of items) {
    const itemId = item.product || item.productId || item._id;
    const qty = item.quantity || item.qty || 1;

    let updated = await Product.findOneAndUpdate(
      { _id: itemId, currentStock: { $gte: qty } },
      { $inc: { currentStock: -qty }, $set: { updatedAt: new Date() } },
      { new: true }
    );

    if (!updated) {
      const productDoc = await Product.findById(itemId).select('name currentStock');

      if (!productDoc) {
        const offerUpdated = await Offer.findOneAndUpdate(
          { _id: itemId, stock: { $gte: qty } },
          { $inc: { stock: -qty }, $set: { updatedAt: new Date() } },
          { new: true }
        );

        if (!offerUpdated) {
          const offerDoc = await Offer.findById(itemId).select('name stock');
          const stockLeft = offerDoc ? offerDoc.stock : 0;
          const name = offerDoc ? offerDoc.name : item.name || itemId;
          return { success: false, error: `"${name}" is Out of Stock. Only ${stockLeft} left.` };
        }
      } else {
        const stockLeft = productDoc.currentStock;
        const name = productDoc.name;
        return { success: false, error: `"${name}" is Out of Stock. Only ${stockLeft} left.` };
      }
    }
  }
  return { success: true };
}

export async function restoreStock(items) {
  for (const item of items) {
    const itemId = item.product || item.productId || item._id;
    const qty = item.quantity || item.qty || 1;

    const productDoc = await Product.findById(itemId);
    if (productDoc) {
      await Product.findByIdAndUpdate(
        itemId,
        { $inc: { currentStock: qty }, $set: { updatedAt: new Date() } }
      );
    } else {
      await Offer.findByIdAndUpdate(
        itemId,
        { $inc: { stock: qty }, $set: { updatedAt: new Date() } }
      );
    }
  }
}
