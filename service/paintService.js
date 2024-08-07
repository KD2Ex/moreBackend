

class PaintService {

    async getByPk(func, localeFunc, id) {
        const item = await func(id);

    }

}

export default new PaintService();