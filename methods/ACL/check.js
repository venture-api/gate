import { collections as c } from '@venture-api/fixtures/dictionary';


/**
 * Check ACE record in DB
 *
 * @async
 * @param {String} principal - ID of the principal entity
 * @param {String} action - principal's action
 * @param {String} resource - ID of the resource upon which the action is performed
 * @return {Array} - first element is Boolean for the check result, second
 *                   (optional) is the reason if result is `false`
 */
export default async function (principal, action, resource) {

    const [ gate, logger ] = this;
    const { db } = gate.state;

    logger.debug('looking up', { principal, action, resource });
    const ACE = await db.collection(c.ACL).findOne({ principal, action, resource });

    logger.debug('got', ACE);
    return ACE ? [ ACE.can, ACE.reason ] : [ false ];
}
