'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

import { PageHeader, PageContent, PageSection } from '@/components/dashboard';
import { Button, Card, CardBody, Input } from '@/components/ui';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  bio: string;
  website: string;
  location: string;
}

export default function EditProfilePage() {
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: session?.user?.name?.split(' ')[0] || '',
    lastName: session?.user?.name?.split(' ').slice(1).join(' ') || '',
    phone: '',
    bio: '',
    website: '',
    location: '',
  });

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <>
      <PageHeader
        title="Edit Profile"
        description="Update your personal information"
        breadcrumbs={[
          { label: 'Member', href: '/member' },
          { label: 'Profile', href: '/member/profile' },
          { label: 'Edit' },
        ]}
      />
      <PageContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Form */}
            <div className="space-y-6 lg:col-span-2">
              <PageSection title="Basic Information">
                <Card>
                  <CardBody>
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            First Name
                          </label>
                          <Input
                            type="text"
                            value={formData.firstName}
                            onChange={(e) =>
                              handleChange('firstName', e.target.value)
                            }
                            placeholder="John"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Last Name
                          </label>
                          <Input
                            type="text"
                            value={formData.lastName}
                            onChange={(e) =>
                              handleChange('lastName', e.target.value)
                            }
                            placeholder="Doe"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Email Address
                        </label>
                        <Input
                          type="email"
                          value={session?.user?.email || ''}
                          disabled
                          className="bg-gray-50 dark:bg-gray-700"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Email cannot be changed. Contact support if you need
                          to update it.
                        </p>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Phone Number
                        </label>
                        <Input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            handleChange('phone', e.target.value)
                          }
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </PageSection>

              <PageSection title="Additional Information">
                <Card>
                  <CardBody>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Bio
                        </label>
                        <textarea
                          rows={4}
                          value={formData.bio}
                          onChange={(e) => handleChange('bio', e.target.value)}
                          placeholder="Tell us about yourself..."
                          className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Brief description for your profile. Max 500
                          characters.
                        </p>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Website
                          </label>
                          <Input
                            type="url"
                            value={formData.website}
                            onChange={(e) =>
                              handleChange('website', e.target.value)
                            }
                            placeholder="https://example.com"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Location
                          </label>
                          <Input
                            type="text"
                            value={formData.location}
                            onChange={(e) =>
                              handleChange('location', e.target.value)
                            }
                            placeholder="San Francisco, CA"
                          />
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </PageSection>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <PageSection title="Profile Photo">
                <Card>
                  <CardBody className="text-center">
                    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                      {session?.user?.image ? (
                        <img
                          src={session.user.image}
                          alt="Profile"
                          className="h-24 w-24 rounded-full object-cover"
                        />
                      ) : (
                        <svg
                          className="h-12 w-12"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full">
                        Upload New Photo
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-red-600 hover:text-red-700"
                      >
                        Remove Photo
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                  </CardBody>
                </Card>
              </PageSection>

              <Card>
                <CardBody>
                  <h3 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                    Account Status
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Verified
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Your email has been verified.
                  </p>
                </CardBody>
              </Card>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <Link href="/member/profile">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </PageContent>
    </>
  );
}
