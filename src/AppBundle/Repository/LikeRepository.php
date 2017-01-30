<?php

namespace Webberdoo\AppBundle\Repository;

/**
 * ApiKeyRepository
 *
 * This class was generated by the Doctrine ORM. Add your own custom
 * repository methods below.
 */
class LikeRepository extends \Doctrine\ORM\EntityRepository
{
    public function getLikeWhereWhere($userId, $videoId)
    {
        return $this->createQueryBuilder('like')
            ->where('like.user_id = :userId')
            ->andwhere('like.video_id = :videoId')
            ->setParameter('userId', $userId)
            ->setParameter('videoId', $videoId)
            ->getQuery()
            ->execute();//get as array of results
    }
}