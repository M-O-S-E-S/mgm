
import { NetworkResponse } from './messages';

let authToken: string = null;

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
                let res: NetworkResponse = JSON.parse(xhr.response);
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

export class ClientStack {
    static updateToken(token: string) {
        authToken = token;
    }

    post(path: string, args?: any): Promise<any> {
        return performCall('POST', path, args);
    }

    get(path: string, args?: any): Promise<any> {
        return performCall('GET', path, args);
    }
}