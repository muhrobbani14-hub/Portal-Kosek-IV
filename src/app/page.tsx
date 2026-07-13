import Image from "next/image";
import { LoginForm } from "@/components/auth/login-form";

export default function Home(){


return (

<main
className="
min-h-screen
relative
flex
items-center
justify-center
overflow-hidden 
"
>


<Image

src="/images/background/landing-page.png"
alt=""
fill
className="
object-cover
"
sizes="100vw"
/>



<div
className="
absolute
inset-0
bg-black/60
"
/>



<div
className="
relative
z-10
w-full
max-w-md
px-6
text-center
"
>


<Image

src="/images/logos/logo-kosek IV.png"
alt="Logo kesatuan"
width={220}
height={220}
className="
mx-auto
mb-8
"
priority
/>



<div
className="rounded-2xl border border-white/15 bg-slate-950/55 p-8 shadow-2x1 backdrop-blur-md">

<h1
className="
text-white
text-3xl
font-bold
mb-6
"
>

Portal Informasi Kesatuan

</h1>

<LoginForm />

</div>


</div>



</main>

)

}