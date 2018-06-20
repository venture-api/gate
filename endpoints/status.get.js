module.exports = async (gate, logger) => {

    const {fastify, tasu} = gate.get();

    fastify.get('/status', async(req, res) => {
        logger.debug('returning status');
        const mold = await tasu.request('mold.status', {});
        return {mold};
    })
};
