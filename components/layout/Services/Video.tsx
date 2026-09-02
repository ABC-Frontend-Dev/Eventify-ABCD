// components/layout/Services/Video.tsx

export default function ServicesVideo() {
    return (
                   <video 
    className="w-full h-full object-cover"
    autoPlay
    loop
    muted
    playsInline
    preload="metadata"
    poster="https://res.cloudinary.com/afdhm38k/image/upload/v1787833659/technical-delivery-av_l5ufkn.jpg"
>
    <source
        src="https://res.cloudinary.com/afdhm38k/video/upload/v1787832702/technical-delivery-av_abrwcv.mp4"
        type="video/mp4"
    />
    Your browser does not support the video tag.
</video>
    );
}
