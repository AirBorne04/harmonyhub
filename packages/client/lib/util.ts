import { IQ } from 'node-xmpp-stanza';

function getUniqueId(): number {
  return Math.floor(Math.random() * 1000000);
}

/**
 * Splits a response from the hub (usualy seperated by ":" and "=") into a
 * proper javascript object.
 */
function decodeColonSeparatedResponse(response: string): object {
  let result: object;

  if (response && typeof response === 'string') {
    const pairs: Array<string> = response.split(':') || [response];
    result = {};

    pairs.forEach((pair) => {
      const keyValue = pair.split('=');

      if (keyValue.length === 2) {
        result[keyValue[0]] = keyValue[1];
      }
    });
  }

  return result;
}

function buildIqStanza(type: string, xmlns: string, mime: string, body: string, from?: string) {
  const iq = new IQ({
    type,
    id: getUniqueId(),
    from
  });

  iq.c('oa', {
    xmlns,
    mime
  }).t(body);

  return iq;
}

export default {
  getUniqueId,
  decodeColonSeparatedResponse,
  buildIqStanza
};
