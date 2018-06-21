module.exports = async (gate, logger) => {

    const {fastify, tasu} = gate.get();

    fastify.get('/status', async() => {
        const mold = await tasu.request('mold.status', {});
        return {mold};
    })
};
