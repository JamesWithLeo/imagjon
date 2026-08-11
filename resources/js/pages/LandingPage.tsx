import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login } from '@/routes';
import { register } from '@/routes';
import UploadDocument from '../components/imageToJson/upload';
import { Github } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export default function LandingPage() {
    const { auth } = usePage().props;
    // if (ImageSources.uploadedImages)
    //     return <h1>{ImageSources.uploadedImages}</h1>;

    return (
        <>
            <Head title="Imagjon" />

            <div className="relative flex min-h-screen w-full flex-col items-center bg-[#FDFDFC] px-6 text-[#1b1b18] lg:justify-start lg:px-8 dark:bg-[#0a0a0a] dark:text-white">
                <header className="sticky top-0 z-10 mb-6 flex h-20 w-full flex-col items-center text-sm backdrop-blur-lg not-has-[nav]:hidden dark:bg-[#0a0a0a]/80">
                    <nav className="flex h-full w-full max-w-4xl items-center justify-between px-6">
                        <h1 className="text-lg">Imagjon</h1>

                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <div className="flex h-8 items-center gap-4 text-sm">
                                {/* <Link
                                    href={login()}
                                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={register()}
                                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                >
                                    Register
                                </Link> */}
                                <Link
                                    href={'/'}

                                    className={cn(
                                        buttonVariants({
                                            variant: 'link',
                                            className: 'rounded-full',
                                        }),
                                    )}
                                >
                                    About
                                </Link>
                                <Separator
                                    orientation="vertical"
                                    className="h-full"
                                />
                                <Link
                                    href={'/'}

                                    className={cn(
                                        buttonVariants({
                                            variant: 'link',
                                            size: 'icon',
                                            className: 'rounded-full',
                                        }),
                                    )}

                                    // className="inline-block rounded-sm py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                >
                                    <Github size={20} />
                                </Link>
                            </div>
                        )}
                    </nav>
                </header>
                <UploadDocument />
            </div>
        </>
    );
}
