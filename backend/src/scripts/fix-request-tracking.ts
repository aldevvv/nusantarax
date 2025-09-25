import { PrismaClient } from '@prisma/client';

/**
 * 🔧 SCRIPT: Fix Request Tracking Issues
 * 
 * This script fixes:
 * 1. Negative requestsUsed values
 * 2. Syncs requestsUsed with actual apiCallLog counts
 * 3. Validates subscription limits
 */

const prisma = new PrismaClient();

async function fixRequestTracking() {
  console.log('🔧 Starting Request Tracking Fix...\n');

  try {
    // 1. Get all subscriptions
    const subscriptions = await prisma.userSubscription.findMany({
      include: {
        plan: true,
        user: {
          select: {
            id: true,
            email: true,
            fullName: true
          }
        }
      }
    });

    console.log(`📊 Found ${subscriptions.length} subscriptions to check\n`);

    let fixedCount = 0;
    let negativeCount = 0;
    let syncedCount = 0;

    for (const subscription of subscriptions) {
      const userId = subscription.userId;
      const userEmail = subscription.user.email;
      
      console.log(`👤 Checking user: ${userEmail} (${userId})`);
      console.log(`   Plan: ${subscription.plan.displayName}`);
      console.log(`   Period: ${subscription.currentPeriodStart.toISOString()} to ${subscription.currentPeriodEnd.toISOString()}`);
      console.log(`   Current requestsUsed: ${subscription.requestsUsed}`);

      // Get actual usage from apiCallLog during current period
      const actualUsage = await prisma.apiCallLog.count({
        where: {
          userId,
          createdAt: {
            gte: subscription.currentPeriodStart,
            lte: subscription.currentPeriodEnd,
          },
          status: 'SUCCESS',
        },
      });

      console.log(`   Actual usage from apiCallLog: ${actualUsage}`);

      // Check if we need to fix
      const needsFix = subscription.requestsUsed !== actualUsage;
      const wasNegative = subscription.requestsUsed < 0;

      if (wasNegative) {
        negativeCount++;
        console.log(`   ❌ NEGATIVE VALUE DETECTED: ${subscription.requestsUsed}`);
      }

      if (needsFix) {
        console.log(`   🔧 SYNCING: ${subscription.requestsUsed} -> ${actualUsage}`);
        
        await prisma.userSubscription.update({
          where: { userId },
          data: { requestsUsed: actualUsage }
        });

        syncedCount++;
        if (wasNegative) fixedCount++;
        console.log(`   ✅ FIXED`);
      } else {
        console.log(`   ✅ Already in sync`);
      }

      console.log(''); // Empty line for readability
    }

    console.log('\n🎉 FIX COMPLETE!');
    console.log(`📊 Summary:`);
    console.log(`   - Total subscriptions checked: ${subscriptions.length}`);
    console.log(`   - Negative values found: ${negativeCount}`);
    console.log(`   - Negative values fixed: ${fixedCount}`);
    console.log(`   - Total synced subscriptions: ${syncedCount}`);
    console.log(`   - Already correct: ${subscriptions.length - syncedCount}`);

    // Validate: Check for any remaining negative values
    const remainingNegative = await prisma.userSubscription.count({
      where: { requestsUsed: { lt: 0 } }
    });

    if (remainingNegative > 0) {
      console.log(`\n⚠️  WARNING: ${remainingNegative} subscriptions still have negative requestsUsed values!`);
    } else {
      console.log(`\n✅ SUCCESS: No negative requestsUsed values remain`);
    }

  } catch (error) {
    console.error('❌ Error fixing request tracking:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  fixRequestTracking()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

export { fixRequestTracking };