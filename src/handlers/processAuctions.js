import { getEndedAuctions } from '../lib/getEndedAuctions';
import { closeAuction } from '../lib/closeAuction';
import createError from 'http-errors';

async function processAuctions(event, context) {
  // getting the auctions which ended and closing the same
  try {
    const auctionsToClose = await getEndedAuctions();

    const closePromises = auctionsToClose.map(auction => closeAuction(auction.id));
    await Promise.all(closePromises);

    return { closed: closePromises.length };
  } catch (error) {
    console.log('Error in processing auctions', error);
    throw new createError.InternalServerError(error);
  }
}

export const handler = processAuctions;
