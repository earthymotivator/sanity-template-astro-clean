import { sanityClient } from "sanity:client";
import groq from "groq";

const visualEditingEnabled = import.meta.env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED === "true";
const token = import.meta.env.SANITY_API_READ_TOKEN;

async function loadQuery<T>(query: string, params: Record<string, any> = {}): Promise<T> {
  return sanityClient.fetch<T>(
    query,
    params,
    {
      perspective: visualEditingEnabled ? 'drafts' : 'published',
      useCdn: !visualEditingEnabled,
      ...(visualEditingEnabled && token ? { token, stega: true } : {}),
    }
  );
}

export async function getPosts(): Promise<Post[]> {
  return loadQuery<Post[]>(
    groq`*[_type == "blog.post" && defined(slug.current)] | order(publishDate desc) {
      ...,
      "slug": slug.current
    }`,
  );
}

export async function getPost(slug: string): Promise<Post> {
  return loadQuery<Post>(
    groq`*[_type == "blog.post" && slug.current == $slug][0] {
      ...,
      "slug": slug.current
    }`,
    { slug },
  );
}

export interface Post {
  _id: string;
  _type: "blog.post";
  _createdAt: string;
  title?: string;
  slug: string;
  content: any[];
  publishDate?: string;
  metadata?: {
    title?: string;
    description?: string;
    image?: any;
  };
}
