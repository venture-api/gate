module.exports = async (gate, logger) => {

    const {http} = gate.modules;
    const tasu = gate.get('tasu');

    http.route({
        method: 'GET',
        pathname: '/status'
    }, async() => {
        logger.debug('returning status');
        const mold = await tasu.request('mold.status', {});
        return {mold};
    })
};
