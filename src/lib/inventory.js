import mongoose from 'mongoose';
import Product from '@/models/Product';
import Offer from '@/models/Offer';

export async function reduceStock(items) {
  if (!items || !Array.isArray(items)) return { success: true };

  const successfullyDeducted = [];

  for (const item of items) {
    const itemId = item.product || item.productId || item._id;
    const qty = Number(item.quantity || item.qty) || 1;
    const itemName = item.name || 'Product';

    if (!itemId) continue;

    const isValidId = mongoose.Types.ObjectId.isValid(itemId);
    let filter = isValidId 
      ? { _id: itemId } 
      : { $or: [{ slug: itemId }, { productCode: itemId }, { name: { $regex: `^${itemName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, $options: 'i' } }] };

    try {
      // 1. Try finding and updating Product stock atomically
      let updated = await Product.findOneAndUpdate(
        { ...filter, currentStock: { $gte: qty } },
        { $inc: { currentStock: -qty }, $set: { updatedAt: new Date() } },
        { new: true }
      );

      if (updated) {
        successfullyDeducted.push({ item, qty, model: 'Product', id: updated._id });
        continue;
      }

      // Check if product exists but stock is insufficient
      const productDoc = await Product.findOne(filter).select('name currentStock');
      if (productDoc) {
        if (productDoc.currentStock < qty) {
          // Rollback previously deducted items in this order
          await restoreStock(successfullyDeducted);
          return {
            success: false,
            error: `"${productDoc.name}" has only ${productDoc.currentStock} unit(s) remaining in warehouse.`
          };
        }
      } else if (isValidId) {
        // 2. Try Offer stock if applicable
        const offerUpdated = await Offer.findOneAndUpdate(
          { _id: itemId, stock: { $gte: qty } },
          { $inc: { stock: -qty }, $set: { updatedAt: new Date() } },
          { new: true }
        );

        if (offerUpdated) {
          successfullyDeducted.push({ item, qty, model: 'Offer', id: itemId });
          continue;
        }

        const offerDoc = await Offer.findById(itemId).select('name stock');
        if (offerDoc && offerDoc.stock < qty) {
          await restoreStock(successfullyDeducted);
          return {
            success: false,
            error: `"${offerDoc.name}" has only ${offerDoc.stock} unit(s) left in stock.`
          };
        }
      }
    } catch (err) {
      console.warn('Inventory reduction warning for item:', itemId, err.message);
    }
  }

  return { success: true };
}

export async function restoreStock(items) {
  if (!items || !Array.isArray(items)) return;

  for (const item of items) {
    const itemId = item.product || item.productId || item._id;
    const qty = item.quantity || item.qty || 1;
    if (!itemId) continue;

    const isValidId = mongoose.Types.ObjectId.isValid(itemId);
    const filter = isValidId ? { _id: itemId } : { $or: [{ slug: itemId }, { productCode: itemId }] };

    try {
      const productDoc = await Product.findOne(filter);
      if (productDoc) {
        await Product.updateOne(
          { _id: productDoc._id },
          { $inc: { currentStock: qty }, $set: { updatedAt: new Date() } }
        );
      } else if (isValidId) {
        await Offer.updateOne(
          { _id: itemId },
          { $inc: { stock: qty }, $set: { updatedAt: new Date() } }
        );
      }
    } catch (err) {
      console.warn('Inventory restore warning for item:', itemId, err.message);
    }
  }
}
