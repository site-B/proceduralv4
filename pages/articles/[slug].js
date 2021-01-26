import { documentToReactComponents } from "@contentful/rich-text-react-renderer"; 
import { BLOCKS } from "@contentful/rich-text-types"; 
import Image from 'next/image'; 

let client = require("contentful").createClient({
    space: process.env.NEXT_CONTENTFUL_SPACE_ID,
    accessToken: process.env.NEXT_CONTENTFUL_ACCESS_TOKEN,
  }); 

// making it fully dynamic: 
export async function getStaticPaths() {
    let data = await client.getEntries({
        content_type: 'article',
    }); 

    // creating a list of all pages that we want to create 
    return {
        paths: data.items.map((item) => ({
            params: { slug: item.fields.slug }, 
        })),
        fallback: true, 
    }; 
}

// also: 
    //it loads each one of those paths and gets the content 
    // it gets a context {}, we can destructure it into params 
export async function getStaticProps({ params }) {

    let data = await client.getEntries({
        content_type: 'article',
        'fields.slug': params.slug,
    }); 

    return {
        props: {
            article: data.items[0],
        },
        revalidate: 1, 
    }
}

// 
export default function Article({ article }) {
    if (!article) return <div>404</div>; 

    return(
        <div>
            <h1>{article.fields.title}</h1>
            <div>
                {documentToReactComponents(article.fields.content, {
                    renderNode: {
                        [BLOCKS.EMBEDDED_ASSET]: (node) => 
                            <Image 
                                src={'https:' + node.data.target.fields.file.url} 
                                width={node.data.target.fields.file.details.image.width}
                                height={node.data.target.fields.file.details.image.height}
                            />
                    }
                })}
            </div>
        </div>
    ); 
};

