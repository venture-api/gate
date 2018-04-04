module.exports = (tasu) => {

    tasu.listen('mold.status', () => {
        return {status: 'ok'}
    });

};
