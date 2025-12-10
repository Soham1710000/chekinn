# Matching algorithm prompts

MATCHING_PROMPT = """You are a matching algorithm for Chekinn, focused ONLY on CAT/MBA and jobs/career conversations.

Your task is to analyze two users and determine if they should be introduced to each other.

Consider:
1. Shared goals (similar CAT targets, similar job transitions)
2. Complementary skills/experiences (one has something useful for the other)
3. Mutual benefit potential (both can learn from each other)
4. Likelihood of good conversation chemistry (similar gravity, not just identical profiles)
5. Both are at a stage where conversation would be helpful (not in crisis, open to connection)

Do NOT optimize for:
- Romance, dating, or relationships
- Surface similarities (same city, same college) as the ONLY reason
- Generic networking

You will be given:
- User A's profile and conversation learnings
- User B's profile and conversation learnings

Respond with a JSON object:
{
  "should_match": true/false,
  "score": 0.0 to 1.0,
  "reason": "1-2 sentences explaining why this could be interesting"
}

If the match isn't strong, set should_match to false and score below 0.6.
"""

def get_matching_prompt(user_a: dict, user_b: dict) -> str:
    """Build matching evaluation prompt"""
    prompt = MATCHING_PROMPT
    
    prompt += "\n\n=== USER A ===\n"
    prompt += f"Name: {user_a.get('name', 'Unknown')}\n"
    prompt += f"City: {user_a.get('city', 'Unknown')}\n"
    prompt += f"Role: {user_a.get('current_role', 'Unknown')}\n"
    prompt += f"Intent: {user_a.get('intent', 'Unknown')}\n"
    
    if user_a.get('learnings'):
        learnings = user_a['learnings']
        prompt += "\nLearnings:\n"
        if learnings.get('big_rocks'):
            prompt += f"- Priorities: {', '.join(learnings['big_rocks'])}\n"
        if learnings.get('recurring_themes'):
            prompt += f"- Themes: {', '.join(learnings['recurring_themes'])}\n"
        if learnings.get('north_star'):
            prompt += f"- Goal: {learnings['north_star']}\n"
    
    prompt += "\n=== USER B ===\n"
    prompt += f"Name: {user_b.get('name', 'Unknown')}\n"
    prompt += f"City: {user_b.get('city', 'Unknown')}\n"
    prompt += f"Role: {user_b.get('current_role', 'Unknown')}\n"
    prompt += f"Intent: {user_b.get('intent', 'Unknown')}\n"
    
    if user_b.get('learnings'):
        learnings = user_b['learnings']
        prompt += "\nLearnings:\n"
        if learnings.get('big_rocks'):
            prompt += f"- Priorities: {', '.join(learnings['big_rocks'])}\n"
        if learnings.get('recurring_themes'):
            prompt += f"- Themes: {', '.join(learnings['recurring_themes'])}\n"
        if learnings.get('north_star'):
            prompt += f"- Goal: {learnings['north_star']}\n"
    
    prompt += "\n\nNow evaluate if these two users should be introduced. Respond ONLY with valid JSON.\n"
    
    return prompt
