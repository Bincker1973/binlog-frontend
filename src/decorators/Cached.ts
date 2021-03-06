const cache = new Map()
/**
 * 缓存数据
 * @param keyGen
 */
export default function (keyGen: (args: any[])=>string = stringParamKeyGen) :any{
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) :any{
        const method = descriptor.value
        descriptor.value = function (...args) {
            let resultMap = cache.get(method) as Map<any, any>
            if(!resultMap){
                resultMap = new Map()
                cache.set(method, resultMap)
            }
            const key = keyGen(args)
            let result = resultMap.get(key)
            if(!result){
                result = method.apply(this, args)
                if(result && result.then){
                    result.catch(()=>resultMap.delete(key))
                }
                resultMap.set(key, result)
            }
            return result
        }
    }
}

/**
 * 参数都是string的key生成器
 */
export function stringParamKeyGen(args: any[]) :string{
    return args.join(",")
}

/**
 * 清除缓存
 * @param fun
 */
export function clearCache(fun: (...args: any)=>any): void{
    cache.delete(fun)
}