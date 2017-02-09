

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

let authToken: string = null;

export function updateToken(token: string) {
    authToken = token;
}

function performCall(method: string, route: string, args?: any) {
    return new Promise<any>((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(method, route, true);
        xhr.onload = () => {
            if (xhr.status !== 200) {
                if (xhr.status === 404)
                    reject(new Error('Request failed.  Does not exist'));
                else
                    reject(new Error('Request failed: server error'));
            } else {
                let res: mgmResponse = JSON.parse(xhr.response);
                if (res.Success) {
                    resolve(res);
                } else {
                    reject(new Error(res.Message));
                }
            }
        };
        if (authToken) {
            xhr.setRequestHeader('x-access-token', authToken);
        }
        if (args) {
            let fd = new FormData();
            for (let key in args) {
                fd.append(key, args[key]);
            }
            xhr.send(fd);
        } else {
            xhr.send();
        }
    });
}

export function post(path: string, args?: any): Promise<any> {
    return performCall('POST', path, args);
}

export function get(path: string, args?: any): Promise<any> {
    return performCall('GET', path, args);
}

/*export function upload(path: string, file: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        let fd = new FormData();
        fd.append('file', file);

        xhr.open('POST', path, true);
        //xhr.setRequestHeader("Content-Type", undefined)
        xhr.onload = () => {
            if (xhr.status !== 200) {
                if (xhr.status === 404)
                    reject(new Error('Request failed.  Does not exist'));
                else
                    reject(new Error('Request failed: server error'));
            } else {
                let res: mgmResponse = JSON.parse(xhr.response);
                if (res.Success) {
                    resolve(res);
                } else {
                    reject(new Error(res.Message));
                }
            }
        };
        xhr.send(fd);
    });
}*/