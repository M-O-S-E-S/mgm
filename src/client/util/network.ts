

function urlEncode(obj: any): string {
    let str: string[] = [];
    for (var p in obj)
        if (obj.hasOwnProperty(p)) {
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        }
    return str.join("&");
}

interface mgmResponse {
    Success: boolean
    Message?: string
}

function performCall(method: string, route: string, args?: any) {
    return new Promise<any>((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(method, route);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
        xhr.onload = () => {
            if (xhr.status !== 200) {
                reject('Request failed.  Returned status of ' + xhr.status);
            } else {
                let res: mgmResponse = JSON.parse(xhr.response);
                if (res.Success) {
                    resolve(res);
                } else {
                    reject(res.Message);
                }
            }
        };
        if (args)
            xhr.send(urlEncode(args));
        else
            xhr.send();

    });
}

export function post(path: string, args?: any): Promise<any> {
    return performCall('POST', path, args);
}

export function get(path: string, args?: any): Promise<any> {
    return performCall('GET', path, args);
}