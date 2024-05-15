import striptags from 'striptags';
import { AllHtmlEntities } from 'html-entities';

export function transform(html: string = ''): string {
  const entities = new AllHtmlEntities();
  return striptags(entities.decode(html));
}
