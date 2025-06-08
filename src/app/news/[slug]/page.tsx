import ScrollToTop from "../../../components/ScrollToTop";
import styles from "../../../styles/NewsDetail.module.css";

interface Paragraph {
    children: { text: string }[];
}

const NewsDetail = async ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = await params;

    // Fetch the news article by slug
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/newses?filters[slug][$eq]=${slug}&populate=*`, {
        next: { revalidate: 60 }, // Revalidate the data every 60 seconds
    });
    const data = await response.json();
    const news = data.data[0]; // Access the first item in the data array

    if (!news) {
        return <p>News not found!</p>;
    }

    return (
        <div className={styles.container}>
            <ScrollToTop />
            {/* Title */}
            <h1 className={styles.title}>{news.title}</h1>

            {/* Date and Author */}
            <p className={styles["text-gray-500"]}>{news.date} | {news.author}</p>

            {/* Image */}
            {news.image && (
                <div className={styles["my-6"]}>
                    <img
                        src={`${news.image[0].formats.large.url}`}
                        alt={news.title}
                    />
                </div>
            )}

            {/* Content */}
            <div className={styles.prose}>
                {Array.isArray(news.content) ? (
                    news.content.map((paragraph: Paragraph, index: number) => (
                        <p key={index}>
                            {paragraph.children.map((child, childIndex) => (
                                <span key={childIndex}>{child.text}</span>
                            ))}
                        </p>
                    ))
                ) : (
                    <p>{news.content}</p>
                )}
            </div>

            {/* Related Links */}
            {news.links && Array.isArray(news.links) && news.links.length > 0 && (
                <div className={styles["mt-4"]}>
                    <h3 className={styles["text-xl"]}>Related Links:</h3>
                    <ul>
                        {news.links.map((link: { url: string; label: string }, index: number) => (
                            <li key={index}>
                                <a
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles["text-blue-600"]}
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default NewsDetail;