import fetch from 'node-fetch';

function constructUrl(urlTemplate: string, params: {}) {
  let url = urlTemplate;
  const props = Object.entries(params).map(([key, value]) => {
    let formattedValue: string;
    if (value instanceof Date) {
      formattedValue = value.toISOString();
    } else {
      formattedValue = encodeURIComponent(value.toString());
    }
    return [key, formattedValue];
  });

  // Fill in the {key} things
  for (let i = 0; i < props.length; i++) {
    const [key, value] = props[i];
    const newUrl = url.replace(`{${key}}`, value).replace(`{/${key}}`, `/${value}`);
    if (newUrl !== url) {
      url = newUrl;
      props.splice(i, 1);
      i--;
    }
  }

  // Clean out the rest of the {key} things
  // Must be lazy to only consume the text inside {}
  url = url.replace(/{.*?}/g, '');

  // And then the query params
  if (props.length > 0) {
    url += `?${props.map(([k, v]) => `${k}=${v}`).join('&')}`;
  }

  return url;
}

export async function fetchData<T>(urlTemplate: string, params = {}): Promise<T> {
  console.log(`Fetching ${urlTemplate} ${JSON.stringify(params)}`);
  const url = constructUrl(urlTemplate, params);

  const headers: any = {
    accept: 'application/vnd.github.mercy-preview+json',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`${url} returned ${res.status}:${res.statusText}`);
  }
  return await res.json();
}
