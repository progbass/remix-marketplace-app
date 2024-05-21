

//
class Fetcher {
  private token: string;
  private request: any;
  constructor(token:string = '', request:any = null) {
    this.token = token;
    this.request = request;
  }

  private configRequest = (options:any) => {
    // NOTE!: This section needs improvement. We apply 'method spoofing' to the request
    // because the Laravel API doesn't support PUT requests with FormData.
    if(
      options?.method === 'PUT'
      // && options?.headers?.["Content-Type"] === 'multipart/form-data'
      && options?.body instanceof FormData
    ) {
      console.log('Spoofing PUT request');
      options.method = 'POST';
      options.body.append('_method', 'PUT');
    }

    if(
      options?.method === 'DELETE'
      // && options?.headers?.["Content-Type"] === 'multipart/form-data'
      && options?.body instanceof FormData
    ) {
      console.log('Spoofing DELETE request');
      options.method = 'POST';
      options.body.append('_method', 'DELETE');
    }

    return options;
  }

  private setAuthorizationHeader = (headers:any) => {
    if(this.token && this.token !== ''){
      headers["Authorization"] = `Bearer ${this.token}`
      return headers;
    }
    headers["Authorization"] = undefined;
    const {Authorization, ...rest} = headers;
    return rest;
  }

  private setCookieHeader = (headers:any) => {
    if(this.request){
      headers["Cookie"] = this.request.headers.get("Cookie");
      return headers;
    }
    if(headers["Cookie"]){
      headers["Cookie"] = headers["Cookie"];
      return headers;
    }
    headers["Cookie"] = undefined;
    const {Cookie, ...rest} = headers;
    return rest;
  }

  private setContentTypeHeader = (headers:any) => {
    if(!headers?.["Content-Type"]){
      console.log('Setting Content-Type Header')
      headers["Content-Type"] = "application/json";
    }
    return headers;
  }

  private setAcceptHeader = (headers:any) => {
    if(!headers?.["Accept"]){
      console.log('Setting Accept Header')
      headers["Accept"] = "application/json";
    }
    return headers;
  }

  fetch = async (
    url: string, 
    options:{ 
      headers?: {
        ["Cookie"]?:string,
        ["Content-Type"]?:string,
        ["Authorization"]?:string,
        ["Accept"]?:string,
      }, 
      method?:string,
      body?: FormData | string | null | undefined | object,
      credentials?: "include" | "same-origin" | "omit" | undefined,
  }) => {
    let {headers = {}, body, ...formattedOptions} = this.configRequest(options) || {};
    // formattedOptions.credentials = 'include';
    headers = this.setAuthorizationHeader(headers);
    headers = this.setCookieHeader(headers);
    //headers = this.setContentTypeHeader(headers);
    headers = this.setAcceptHeader(headers);
    console.log('headers ', headers, 'options ', formattedOptions, 'url ', url)

    // Return formatted fetch request
    return fetch(
        url,
        {
          headers: {...headers},
          ...formattedOptions, 
          body: body,
        }
      ).then(async (res) => {
        if(!res.ok){return Promise.reject(await res.json())};
        if (res.error) {
          console.log(res.error);
          throw new Error(res.error);
        }
        return Promise.resolve(res.json());
      })
      .catch((err) => {
        console.error(err);
        // throw new Error(err);
        return Promise.reject(err)
      });
  }
}
export { Fetcher };
export default Fetcher;