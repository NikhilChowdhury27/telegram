const S3_TO_CDN_REPLACEMENT_POLICY = [
    {
        source: 'clevertapimages.s3.ap-south-1.amazonaws.com',
        cdn: 'ddq4z1bkyusat.cloudfront.net',
        detectRegex: /clevertapimages\.s3\.ap-south-1\.amazonaws\.com/gi
    },
    {
        source: 'whitelabel-assets.s3.ap-south-1.amazonaws.com',
        cdn: 'd21qmqg3g5bkb7.cloudfront.net',
        detectRegex: /whitelabel-assets\.s3\.ap-south-1\.amazonaws\.com/gi
    },
    {
        source: 'cp-assets-public.s3.ap-south-1.amazonaws.com',
        cdn: 'd2sqt6igbl7quy.cloudfront.net',
        detectRegex: /cp-assets-public\.s3\.ap-south-1\.amazonaws\.com/gi
    },
    {
        source: 'cp-assets-public.s3.amazonaws.com',
        cdn: 'd2sqt6igbl7quy.cloudfront.net',
        detectRegex: /cp-assets-public\.s3\.amazonaws\.com/gi
    },
    {
        source: 'test-portal-assets.s3.ap-south-1.amazonaws.com',
        cdn: 'davlfu9ldm6w8.cloudfront.net',
        detectRegex: /test-portal-assets\.s3\.ap-south-1\.amazonaws\.com/gi
    },
    {
        source: 's3.ap-south-1.amazonaws.com/test-portal-assets',
        cdn: 'davlfu9ldm6w8.cloudfront.net',
        detectRegex: /s3\.ap-south-1\.amazonaws\.com\/test-portal-assets/gi
    },
    {
        source: 'classplus-lead-pics.s3.ap-south-1.amazonaws.com',
        cdn: 'd1p1zkew64tc0e.cloudfront.net',
        detectRegex: /classplus-lead-pics\.s3\.ap-south-1\.amazonaws\.com/gi
    },
    {
        source: 'fee-receipts-prod.s3.ap-south-1.amazonaws.com',
        cdn: 'd2dt2le72mndqo.cloudfront.net',
        detectRegex: /fee-receipts-prod\.s3\.ap-south-1\.amazonaws\.com/gi
    }
];

export const CDNify = (str) => {
    if (typeof str != 'string') return str;
    S3_TO_CDN_REPLACEMENT_POLICY.forEach((policy) => {
        str = str.replace(policy.detectRegex, policy.cdn);
    });
    return str;
};
