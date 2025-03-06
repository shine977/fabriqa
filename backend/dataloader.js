class DataLoader {
     batch = new Map();
     cache = new Map();
    //  batchLoadFn: (keys) => void;
     options =  { cache: true };

    constructor(
        batchLoadFn,
        options
    ) {
        this.batchLoadFn = batchLoadFn;
        if (options) {
            this.options = options;
        }
    }

    load(key) {
        // 1. 如果启用缓存且存在缓存，直接返回
        if (this.options.cache && this.cache.has(key)) {

            return Promise.resolve(this.cache.get(key));
        }

        // 2. 创建新的 Promise
        return new Promise((resolve, reject) => {
            this.batch.set(key, { resolve, reject });

            // 3. 如果这是第一个请求，调度批处理
            if (this.batch.size === 1) {
                Promise.resolve().then(() => this.dispatchBatch());
            }
        });
    }

     async dispatchBatch() {
        const batch = this.batch;
        console.log('batch:',batch)
        this.batch = new Map(); // 重置批处理队列

        const keys = Array.from(batch.keys());
        console.log('keys:',keys)
        try {
            // 执行批量加载
            const results = await this.batchLoadFn(keys);

            // 验证返回结果长度
            if (results.length !== keys.length) {
                throw new Error('批处理函数必须返回与键数组长度相同的结果数组');
            }
            console.log('results:',results)
            // 处理结果
            results.forEach((result, i) => {
                const key = keys[i];
               
                if (this.options.cache) {
                    this.cache.set(key, result);
                }
                batch.get(key).resolve(result);
            });
        } catch (error) {
            // 错误处理
            keys.forEach(key => {
                batch.get(key).reject(error);
            });
        }
    }

    // 清除缓存
    clear(key) {
        this.cache.delete(key);
        return this;
    }

    // 清除所有缓存
    clearAll() {
        this.cache.clear();
        return this;
    }
}

// 使用示例：
async function example() {
    // 创建一个模拟的数据库查询函数
    async function mockDbQuery(ids) {
        console.log('执行批量查询:', ids);
        // 模拟数据库查询延迟
        await new Promise(resolve => setTimeout(resolve, 100));
        return ids.map(id => ({ id, name: `Menu ${id}` }));
    }

    // 创建 DataLoader 实例
    const menuLoader = new DataLoader(async (ids) => {
        return await mockDbQuery(ids);
    });

    // 示例 1：使用 await
    console.log('示例 1：使用 await');
    const menu1 = await menuLoader.load(1);
    const menu2 = await menuLoader.load(2);
    const menu3 = await menuLoader.load(3);
    console.log('结果:', menu1, menu2, menu3);

    // 示例 2：不使用 await
    console.log('\n示例 2：不使用 await');
    const promise1 = menuLoader.load(4);
    const promise2 = menuLoader.load(5);
    const promise3 = menuLoader.load(6);
    // 稍后处理结果
    Promise.all([promise1, promise2, promise3]).then(results => {
        console.log('结果:', results);
    });
}

// 运行示例
example();