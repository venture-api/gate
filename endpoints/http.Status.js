export default async (gate, logger) => {

    const { HTTP } = gate.services;
    // const { tasu } = gate.state;

    HTTP.addRoute({

        method: 'GET',
        pathname: '/status'

    }, async () => {
        logger.debug('returning status');
        // const mold = await tasu.request('mold.status', {});
        return {  };
    })
};
